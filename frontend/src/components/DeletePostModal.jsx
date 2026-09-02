import React from 'react';
import styles from '../styles/DeletePostModal.module.css';

const DeletePostModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Delete Post?</h3>
                <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                <div className={styles.buttonGroup}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.deleteBtn} onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default DeletePostModal;