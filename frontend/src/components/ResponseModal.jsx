import React, { useContext } from 'react'
import { ModalContext } from '../context/modalContext';
import styles from '../styles/ResponseModal.module.css'
import { createPortal } from 'react-dom'
import profileImage from '../assets/megan.png'
import { Link } from 'react-router-dom'

const ResponseModal = ({ item }) => {
    
    const { setShowModal } = useContext(ModalContext)
    return createPortal(
        <div className={styles.modal}>
            <div className={styles.modalTop}>
                <div className={styles.closeModal} onClick={() => setShowModal(false)}>X</div>
            </div>
            <div className={styles.question}>
                <div className={styles.questionInfo}>
                    <div className={styles.emoji}>
                        {[...item.questionId.text][0] || '❓'}
                    </div>
                    <div className={styles.statement}>
                        {item.questionId.text.slice([...item.questionId.text][0].length + 1).trim()}
                    </div>
                </div>
                <div className={styles.options}>
                    {
                        item.questionId?.options.map(({ userId: user }) => {

                            return (
                                <Link to={`/profile/${user.name}/posts`} className={`${styles.option} 
                                ${ item.selectedOption._id === user._id ?
                                        styles.selectedOption : styles.freezedOption}`}
                                    key={user._id}
                                    style={{textDecoration:"none"}}
                                    onClick={()=> setShowModal(false)}
                                >
                                    <img src={user.avatar || profileImage} alt="profile" className={styles.optionProfileImage} />
                                    {user.name}
                                </Link>
                            )
                        })
                    }
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')
    )
}

export default ResponseModal