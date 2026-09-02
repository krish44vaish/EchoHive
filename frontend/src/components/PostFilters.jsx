import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import styles from '../styles/PostFilters.module.css'

const PostFilters = ({ setPostType, postType }) => {
    const { pathname } = useLocation()
    return (
        <>
            <div className={styles.postFilters}>
                <Link to={pathname.includes('college') ? '/explore/college/latest' : '/explore/global/latest'} className={`${styles.linkStyles} ${(!pathname.includes('trending') && !pathname.includes('popular')) ? styles.selected : ""}`}>
                    <span>Latest</span>
                </Link>
                <Link to={pathname.includes('college') ? '/explore/college/trending' : '/explore/global/trending'} className={`${styles.linkStyles} ${pathname.includes('trending') ? styles.selected : ""}`}>
                    <span>Trending</span>
                </Link>
                {/*TODO: Will add popular thing as well in future */}
                {/* <Link to={pathname.includes('college') ? '/explore/college/popular' : '/explore/global/popular'} className={`${styles.linkStyles} ${pathname.includes('popular') ? styles.selected : ""}`}>
                    <span>Popular</span>
                </Link> */}
            </div>
            <div className={styles.postTypeFilters}>
                <button
                    className={`${postType === 'All' ? styles.active : ""} ${styles.filterBtn}`}
                    onClick={() => setPostType('All')}
                >All</button>
                <button
                    className={`${postType === 'meme' ? styles.active : ""} ${styles.filterBtn}`}
                    onClick={() => setPostType('meme')}
                >😂 Meme</button>
                <button
                    className={`${postType === 'confession' ? styles.active : ""} ${styles.filterBtn}`}
                    onClick={() => setPostType('confession')}
                >❤️ Confession</button>
                <button
                    className={`${postType === 'question' ? styles.active : ""} ${styles.filterBtn}`}
                    onClick={() => setPostType('question')}
                >💡Question</button>
            </div>
        </>
    )
}

export default PostFilters