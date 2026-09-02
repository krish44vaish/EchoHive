import React from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import styles from '../styles/DripsPage.module.css'
import Activity from '../components/Activity'
import Inbox from '../components/Inbox'
import Poll from '../components/Poll'
import PollsRedirect from '../components/PollsRedirect'

const DripsPage = () => {
    const { pathname } = useLocation()
    return (
        <div className={styles.dripsPage}>
            <div className={styles.dripsPageNav}>
                <Link className={styles.linkStyles} to={`/drips/poll`}>
                    <span className={`${!pathname.endsWith("activity") && !pathname.endsWith("inbox") ? styles.selected : ""}`}>Poll</span>
                </Link>
                <Link className={styles.linkStyles} to={`/drips/activity`}>
                    <span className={`${pathname.endsWith("activity") ? styles.selected : ""}`}>Activity</span>
                </Link>
                <Link className={styles.linkStyles} to={`/drips/inbox`}>
                    <span className={`${pathname.endsWith("inbox") ? styles.selected : ""}`}>Inbox</span>
                </Link>
            </div>
            <Routes>
                <Route path='poll' element={<PollsRedirect/>}/>
                <Route path='poll/:questionIndex' element={<Poll/>}/>
                <Route path='activity' element={<Activity/>}/>
                <Route path='inbox' element={<Inbox/>}/>
            </Routes>
        </div>
    )
}

export default DripsPage