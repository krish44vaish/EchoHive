import React from 'react'
import styles from '../styles/TopBar.module.css'
import { Link, useLocation } from 'react-router-dom'

const TopBar = () => {
    const { pathname } = useLocation();
    
    return (
        <div className={styles.topBar}>
            <Link to='/explore/college' className={styles.linkStyles}>
                <span className={pathname.includes('college') ? styles.selected : ""}>College Feed</span>
            </Link>
            <Link to='/explore/global' className={styles.linkStyles}>
                <span className={pathname.includes('global') ? styles.selected : ""}>Global Feed</span>
            </Link>
        </div>
    )
}

export default TopBar