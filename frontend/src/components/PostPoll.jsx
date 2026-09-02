import React, { useEffect, useState } from 'react'
import styles from '../styles/PostPoll.module.css'
import { useSelector } from 'react-redux'
import { votePoll } from '../api/poll'

const PostPoll = ({ poll, postId }) => {
    const [isFreezed, setIsFreezed] = useState(false)
    const [postPoll, setPostPoll] = useState(null)
    const [userVote, setUserVote] = useState(null)
    const user = useSelector((state) => state.auth.user)

    useEffect(() => {
        if (poll) {
            setPostPoll(poll)
            const hasExpired = new Date(poll.expiresAt) < new Date()
            const userVoteIndex = poll.voters.find(voter => user._id === voter.userId)?.optionIndex
            
            if (hasExpired || userVoteIndex !== undefined) {
                setIsFreezed(true)
                if (userVoteIndex !== undefined) {
                    setUserVote(userVoteIndex)
                }
            }
        }
    }, [poll, user])

    const handleVotePoll = async (index) => {
        try {
            await votePoll(postId, poll._id, index)
            setIsFreezed(true)
            setUserVote(index)

            setPostPoll(prev => ({
                ...prev,
                options: prev.options.map((option, i) => ({
                    ...option,
                    votes: i === index ? option.votes + 1 : option.votes
                })),
                voters: [...prev.voters, { userId: user._id, optionIndex: index }]
            }));

        } catch (error) {
            console.error('Voting failed:', error.message)
        }
    }

    if (isFreezed && postPoll) {
        const totalVotes = Math.max(postPoll.voters.length, 1)
        const maxVotes = Math.max(...postPoll.options.map(option => option.votes))

        return (
            <div className={styles.freezedPoll}>
                {postPoll.options.map((option, index) => {
                    const percentage = Math.min(Math.max((option.votes / totalVotes) * 100, 2), 100)
                    const isUserVote = userVote === index
                    const isHighest = option.votes === maxVotes && maxVotes > 0

                    return (
                        <div key={index} className={`
                            ${styles.freezedPollOption}
                            ${isHighest ? styles.highestVotes : ''}
                            ${isUserVote ? styles.userVote : ''}
                        `}>
                            <div 
                                className={styles.fillBar} 
                                style={{ width: `${percentage}%` }}
                            />
                            <span className={styles.optionText}>{option.text}</span>
                            <span className={styles.voteCount}>
                                {option.votes} ({option.votes !==0 ? Math.round(percentage) : 0}%)
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className={styles.poll}>
            {postPoll?.options?.map((option, index) => (
                <p 
                    key={index}
                    className={styles.pollOption} 
                    onClick={() => handleVotePoll(index)}
                >
                    <span>{option.text}</span>
                </p>
            ))}
        </div>
    )
}

export default PostPoll