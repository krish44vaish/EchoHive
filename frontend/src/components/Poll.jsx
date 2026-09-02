import React, { useState, useEffect } from 'react';
import styles from '../styles/Poll.module.css';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FaRandom, FaStepForward } from "react-icons/fa";
import { MdShuffle, MdSkipNext } from "react-icons/md";
import profileImage from '../assets/megan.png';
import lock from '../assets/Lock.gif'
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getDrip, getQuestion, shuffleOptions, skipLast, updateDrip } from '../api/drips';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux'
import PulsingDots from './PulsingDots';

const Poll = () => {
    const { questionIndex } = useParams()
    const navigate = useNavigate()
    const friends = useSelector((state) => state.friend.friends)
    const queryClient = useQueryClient()

    const [timeLeft, setTimeLeft] = useState({
        hours: 1,
        minutes: 0,
        seconds: 0,
    });
    const [progress, setProgress] = useState(10); // Starts at 100%
    const { data: drip } = useQuery({
        queryKey: ['drip'],
        queryFn: getDrip,
    });

    const { data: question, isLoading, isError } = useQuery({
        queryKey: ['question', questionIndex],
        queryFn: () => getQuestion(drip._id, questionIndex - 1),
        enabled: !!drip?._id, // Only fetch if drip._id exists
    });

    // Simulate countdown (replace with actual poll schedule logic)
    useEffect(() => {
        const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
        const interval = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(interval);
                return;
            }
            const newTotalSeconds = totalSeconds - 1;
            const hours = Math.floor(newTotalSeconds / 3600);
            const minutes = Math.floor((newTotalSeconds % 3600) / 60);
            const seconds = newTotalSeconds % 60;
            setTimeLeft({ hours, minutes, seconds });
            setProgress(((3600 - newTotalSeconds) / 3600) * 100); // 1h initial time
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    useEffect(() => {
        if (!drip?.activityDate) return;

        const targetTime = new Date(drip.activityDate).getTime();
        const now = Date.now();
        const diffInMs = targetTime - now;

        if (diffInMs <= 0) {
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const totalSeconds = Math.floor(diffInMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTimeLeft({ hours, minutes, seconds });
    }, [drip]);


    // useEffect(() => console.log(question), [question])

    const handleUpdateDrip = async (userId) => {
        // updating the drip
        const response = await updateDrip(drip._id, questionIndex - 1, userId)
        // console.log(response.questions[questionIndex - 1].options);

        queryClient.setQueryData(['question', questionIndex], (oldData) => ({
            ...oldData,
            questionResponse: response.questions[questionIndex - 1].questionResponse
        }));

        // here we are handling the submission logic
        if (Number(questionIndex) === drip.questions.length) {
            navigate(`/drips/poll/0`)
        }
    }

    const handlePrevious = () => {
        if (questionIndex > 1) {
            navigate(`/drips/poll/${questionIndex - 1}`)
        }
    }

    const handleNext = () => {
        if (questionIndex < drip?.questions?.length) {
            navigate(`/drips/poll/${Number(questionIndex) + 1}`)
        }
    }

    const handleSkip = async () => {
        if (questionIndex < drip?.questions?.length) {
            navigate(`/drips/poll/${Number(questionIndex) + 1}`)
        } else {
            // submit the poll and redirect to page 0
            await skipLast(drip._id)
            navigate(`/drips/poll/0`)
        }
    }
    const handleShuffle = async () => {
        const randomFriends = friends.slice().sort(() => Math.random()).slice(0, 4).map(friend => friend._id)
        // console.log(randomFriends);

        const response = await shuffleOptions(drip?._id, questionIndex - 1, randomFriends)

        queryClient.setQueryData(['question', questionIndex], (oldData) => {
            return ({
                ...oldData,
                options: response
            })
        }
        );
    }
    
    if (isError) {
        return (
          <div className={styles.pollContainer}>
            <div className={styles.questions}>
               <div className={styles.errorText}>
                  Some Error Occurred...
                </div>
            </div>
          </div>
        )
      }


    if (Number(questionIndex) === 0) {

        const activityTime = new Date(drip?.activityDate).getTime();
        const now = Date.now();

        if (activityTime < now) {
            return (
                <div className={styles.pollContainer}>
                    <div className={styles.questions}>
                        <div className={styles.inactivePoll}>
                            <p className={styles.inactiveMessage}>
                                Poll is Active
                            </p>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${100}%` }}
                                ></div>
                            </div>
                            <img src={lock} alt="lock" />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.pollContainer}>
                <div className={styles.questions}>
                    <div className={styles.inactivePoll}>
                        <p className={styles.inactiveMessage}>
                            Next poll in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                        </p>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <img src={lock} alt="lock" />
                    </div>
                </div>
            </div>
        );
    }

    const activityTime = new Date(drip?.activityDate).getTime();
    const now = Date.now();

    if (activityTime >= now) {
        return (
            <Navigate to='/drips/poll/0' />
        )
    }

    return (
        <div className={styles.pollContainer}>
            <div
                className={`${styles.arrow} ${parseInt(questionIndex) === 1 ? styles.freezedArrow : ""}`}
                onClick={handlePrevious}
            >
                <FaArrowLeft size={30} />
            </div>
            <div className={styles.questions}>
                <div className={styles.questionsFill}>
                    {/* A rectangular fill to check what question you are at right now.*/}
                    {/* Once you respond to the last question. The poll will be marked as inactive.*/}
                    <div className={styles.fill}>
                        <div className={styles.actualFill} style={{ width: `${questionIndex / (drip?.questions.length || 6) * 100}%` }}></div>
                    </div>
                    <div className={styles.questionsCount}>
                        {questionIndex} / {drip?.questions?.length}
                    </div>
                </div>
                {
                    isLoading ?
                    <div className={styles.loaderStyles}>
                        <PulsingDots color={'pink'}/>
                    </div> : (
                            <>
                                <div className={styles.question}>
                                    <div className={styles.questionInfo}>
                                        {question?.text && (
                                            <>
                                                {/* Using the spread operator, you're converting the string into an array of Unicode-aware characters (called grapheme clusters), so each emoji or symbol is treated as a full character */}
                                                <div className={styles.emoji}>
                                                    {[...question.text][0] || '❓'} {/* Fallback emoji */}
                                                </div>
                                                <div className={styles.statement}>
                                                    {question.text.slice([...question.text][0].length + 1).trim()}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className={styles.options}>
                                        {
                                            question?.options.map(({ userId: user }) => {

                                                return (
                                                    <div key={user._id} className={`${styles.option} ${question?.questionResponse ?
                                                        question?.questionResponse?.selectedOption === user._id ?
                                                            styles.selectedOption :
                                                            styles.freezedOption : ""}`}
                                                        onClick={() => handleUpdateDrip(user._id)}
                                                    >
                                                        <img src={user.avatar || profileImage} alt="profile" className={styles.optionProfileImage} />
                                                        {user.name}
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                <div className={styles.questionOptions}>
                                    <button
                                        className={`${styles.questionOption} ${question?.questionResponse?._id ? styles.disabled : ''}`}
                                        onClick={handleShuffle}
                                    >
                                        <FaRandom size={25} />
                                        Shuffle
                                    </button>

                                    <button
                                        className={`${styles.questionOption} ${question?.questionResponse?._id ? styles.disabled : ''}`}
                                        onClick={handleSkip}
                                    >
                                        <FaStepForward size={25} style={{ transform: "scaleY(0.8)" }} />
                                        Skip
                                    </button>
                                </div>
                            </>
                        )
                }
            </div>
            <div
                className={`${styles.arrow} ${parseInt(questionIndex) === drip?.questions?.length ? styles.freezedArrow : ""}`}
                onClick={handleNext}
            >
                <FaArrowRight size={30} />
            </div>
        </div>
    )
}

export default Poll