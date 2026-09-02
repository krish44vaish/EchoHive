import React, { useState, useEffect, useRef } from 'react'
import { ModalContext } from '../context/modalContext';
import styles from '../styles/CreatePostModal.module.css'
import { createPortal } from 'react-dom'
import { FaGhost, FaGlobe } from "react-icons/fa";
import { toast } from 'sonner'
import { updatePost } from '../api/post'; // You'll need to create this API function

const EditPostModal = ({ post, toggleEditModalOpen, onPostUpdated }) => {
    const [content, setContent] = useState(post.content || '')
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(post.media?.url || "")
    const [poll, setPoll] = useState(post.poll || []) // poll denoted by array of options
    const [loading, setLoading] = useState(false)
    const [isAnonymous, setIsAnonymous] = useState(post.isAnonymous || false)
    const [isGlobal, setIsGlobal] = useState(post.isGlobal || false)
    const [postType, setPostType] = useState(post.postType || "confession")
    const [removeImage, setRemoveImage] = useState(false)
    const mediaRef = useRef()

    // Initialize form with post data
    useEffect(() => {
        if (post) {
            setContent(post.content || '');
            setIsAnonymous(post.isAnonymous || false);
            setIsGlobal(post.isGlobal || false);
            setPostType(post.postType || "confession");
            setPreview(post.media?.url || "");
            setPoll(post.pollId?.options?.map(({ text }) => text) || []);
        }
    }, [post]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0])
            let fileReader = new FileReader()
            fileReader.onload = (e) => {
                const { result } = e.target;
                setPreview(result)
            }
            fileReader.readAsDataURL(e.target.files[0])
        }
    }

    const handleUpdatePost = async () => {
        setLoading(true);
        try {
            const formData = new FormData();

            formData.append("isAnonymous", isAnonymous)
            formData.append("content", content)
            formData.append("postType", postType)
            formData.append("isGlobal", isGlobal)
            formData.append("removeImage", removeImage)

            if (poll.length > 0) {
                poll.forEach((option) => {
                    formData.append("poll[]", option);
                });
            }
            if (file) {
                formData.append("image", file)
            }

            console.log("FormData contents:");
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await updatePost(formData, post._id)
            toast.success("Post updated successfully")
            onPostUpdated(response.data); // Callback to update the post in parent component
            toggleEditModalOpen();
        } catch (error) {
            toast.error(error.message)
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleRemovePreview = () => {
        setFile(null)
        setPreview('')
        setRemoveImage(true)
    }

    const handleRemovePoll = () => {
        setPoll([])
    }

    const handleAddOption = () => {
        setPoll(prev => [...prev, `Option ${prev.length + 1}`])
    }

    const removeOption = (index) => {
        setPoll(prev => prev.filter((value, optionIndex) => { return optionIndex !== index }))
    }

    return createPortal(
        <div className={styles.modal}>
            <div className={styles.modalTop}>
                <div className={styles.toggleSwitchContents}>
                    <div className={styles.toggleSwitch} onClick={() => setIsAnonymous(!isAnonymous)}>
                        <div className={`${styles.toggleCircle} ${isAnonymous ? styles.isAnonymous : ""}`}>
                            {isAnonymous && <FaGhost size={15} />}
                        </div>
                    </div>
                    <span>{isAnonymous ? "You're Anonymous" : ""}</span>
                </div>
                <div className={styles.toggleSwitchContents}>
                    <div className={styles.toggleSwitch} onClick={() => setIsGlobal(!isGlobal)}>
                        <div className={`${styles.toggleCircle} ${isGlobal ? styles.isAnonymous : ""}`}>
                            {isGlobal && <FaGlobe size={19} />}
                        </div>
                    </div>
                    <span>{isGlobal ? "Global Post" : ""}</span>
                </div>
                <div className={styles.closeModal} onClick={toggleEditModalOpen}>✕</div>
            </div>
            <div className={styles.postTypeFilters}>
                <button className={`${postType === "meme" ? styles.active : ""} ${styles.filterBtn}`}
                    onClick={() => setPostType("meme")}>😂 Meme</button>
                <button className={`${postType === "confession" ? styles.active : ""} ${styles.filterBtn}`}
                    onClick={() => setPostType("confession")}>❤️ Confession</button>
                <button className={`${postType === "question" ? styles.active : ""} ${styles.filterBtn}`}
                    onClick={() => setPostType("question")}>💡Question</button>
            </div>
            <div className={styles.postInfo}>
                <textarea
                    type="text"
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className={styles.contentInput}
                />

                <input
                    type="file"
                    name="media"
                    ref={mediaRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                    hidden
                />

                {preview && (
                    <div className={styles.previewContainer}>
                        <img src={preview} alt="preview" className={styles.previewImage} />
                        <span className={styles.closeButton} onClick={handleRemovePreview}>✕</span>
                    </div>
                )}

                {poll.length > 0 && (
                    <div className={styles.pollContainer}>
                        {poll.map((option, index) => (
                            <div className={styles.pollOptions} key={index}>
                                <div className={styles.pollOption}>
                                    <input
                                        key={index}
                                        type="text"
                                        value={poll[index]}
                                        onChange={(e) => setPoll(prev =>
                                            prev.map((option, optionIndex) =>
                                                optionIndex !== index ? option : e.target.value.length <= 25 ? e.target.value : option
                                            )
                                        )}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    <p>{poll[index].length} /25</p>
                                </div>
                                {index >= 2 && (
                                    <div className={styles.removeOption} onClick={() => removeOption(index)}>
                                        X
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className={styles.actionButtons}>
                            {
                                poll.length < 6 &&
                                <span className={styles.addButton} onClick={handleAddOption}>+</span>
                            }
                            <span className={styles.closeButton} onClick={handleRemovePoll}>✕</span>
                        </div>
                    </div>
                )}

                <div className={styles.actionButtons}>
                    <button
                        onClick={() => mediaRef.current.click()}
                        className={file || poll.length > 0 ? styles.noUpload : ""}
                        aria-label="Upload media"
                        disabled={poll.length > 0}
                    >
                        {poll.length > 0 ? "Poll active" : "Upload Image"}
                    </button>

                    <button
                        onClick={() => setPoll(poll.length ? [] : ["Option 1", "Option 2"])}
                        className={file ? styles.noUpload : ""}
                        disabled={!!preview}
                    >
                        {poll.length ? "Remove Poll" : "Create Poll"}
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>Updating post...</div>
                ) : (
                    <button
                        onClick={handleUpdatePost}
                        disabled={!content && (!file || !poll.length)}
                        className={!content && !file && !poll.length ? styles.noUpload : ""}
                    >
                        Update Post
                    </button>
                )}
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}

export default EditPostModal;