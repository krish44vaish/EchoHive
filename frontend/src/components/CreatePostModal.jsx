import React, { useContext, useEffect, useRef, useState } from 'react'
import styles from '../styles/CreatePostModal.module.css'
import { createPortal } from 'react-dom'
import { FaGhost, FaGlobe } from "react-icons/fa";
import { toast } from 'sonner'
import { createPost } from '../api/post';

const CreatePostModal = ({ togglePostModalOpen }) => {

    const [content, setContent] = useState('')
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState("")
    const [poll, setPoll] = useState([]) // poll denoted by array of options
    const [loading, setLoading] = useState(false)
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [isGlobal, setIsGlobal] = useState(false)
    const [postType, setPostType] = useState("confession")
    const mediaRef = useRef()

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

    const handleCreatePost = async () => {
        setLoading(true);
        try {
            const formData = new FormData();

            formData.append("isAnonymous", isAnonymous)
            formData.append("content", content)
            formData.append("postType", postType)
            formData.append("isGlobal", isGlobal)
            if (poll.length > 0) {
                poll.forEach((option) => {
                    formData.append("poll[]", option);
                });
            }
            if (file) {
                formData.append("image", file)
            }
            const response = await createPost(formData)
            // console.log("Post created finally");
            toast.success("Post created successfully")
            togglePostModalOpen();
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
                            {/* wow */}
                            {
                                isAnonymous ?
                                    <>
                                        <FaGhost size={15} />
                                    </> :
                                    ""
                            }
                        </div>
                    </div>
                    <span>
                        {
                            isAnonymous ?
                                "You're Anonymous" :
                                ""
                        }
                    </span>
                </div>
                <div className={styles.toggleSwitchContents}>
                    <div className={styles.toggleSwitch} onClick={() => setIsGlobal(!isGlobal)}>
                        <div className={`${styles.toggleCircle} ${isGlobal ? styles.isAnonymous : ""}`}>
                            {/* wow */}
                            {
                                isGlobal ?
                                    <FaGlobe size={19} /> :
                                    ""
                            }
                        </div>
                    </div>
                    <span>
                        {
                            isGlobal ?
                                "Global Post" :
                                ""
                        }
                    </span>
                </div>
                <div className={styles.closeModal} onClick={togglePostModalOpen}>✕</div>
            </div>
            <div className={styles.postTypeFilters}>
                <button className={`${postType === "meme" ? styles.active : ""} ${styles.filterBtn}`} onClick={() => setPostType("meme")}>😂 Meme</button>
                <button className={`${postType === "confession" ? styles.active : ""} ${styles.filterBtn}`} onClick={() => setPostType("confession")}>❤️ Confession</button>
                <button className={`${postType === "question" ? styles.active : ""} ${styles.filterBtn}`} onClick={() => setPostType("question")}>💡Question</button>
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
                                    <p>
                                        {poll[index].length} /25
                                    </p>
                                </div>
                                {
                                    index >= 2 &&
                                    (
                                        <div className={styles.removeOption} onClick={() => removeOption(index)}>
                                            X
                                        </div>
                                    )
                                }
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
                        disabled={poll.length > 0}
                    >
                        {poll.length > 0 ? "Poll active" : "Upload Image"}
                    </button>

                    <button
                        onClick={() => setPoll(poll.length ? [] : ["Option 1", "Option 2"])}
                        className={file ? styles.noUpload : ""}
                        disabled={!!file}
                    >
                        {poll.length ? "Remove Poll" : "Create Poll"}
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>Creating post...</div>
                ) : (
                    <button
                        onClick={handleCreatePost}
                        disabled={!content && (!file || !poll.length)}
                        className={!content && !file && !poll.length ? styles.noUpload : ""}
                    >
                        Create Post
                    </button>
                )}
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}

export default CreatePostModal