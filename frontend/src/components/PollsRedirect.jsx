import { useQuery } from '@tanstack/react-query'
import { getDrip } from '../api/drips'
import { Navigate } from 'react-router-dom'
import styles from '../styles/Poll.module.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import PulsingDots from './PulsingDots'

const PollsRedirect = () => {
  // fetch the drip and decide where to direct the user
  const { data: drip, isLoading, isError } = useQuery({
    queryKey: ['drip'],
    queryFn: getDrip,
  })

  // Find the index of the first unanswered question
  const firstUnansweredIndex = new Date(drip?.activityDate) > Date.now() ? -1 : drip?.questions?.findIndex(
    question => question.questionResponse === null
  ) ?? -1

  if (isLoading) {
    return (
      <div className={styles.pollContainer}>
        <div
          className={`${styles.arrow} ${styles.freezedArrow}`}
        >
          <FaArrowLeft size={30} />
        </div>
        <div className={styles.questions}>
          <div className={styles.questionsFill}>
            {/* A rectangular fill to check what question you are at right now.*/}
            {/* Once you respond to the last question. The poll will be marked as inactive.*/}
            <div className={styles.fill}>
              <div className={styles.actualFill} style={{ width: "100%" }}></div>
            </div>
            <div className={styles.questionsCount}>
              6 / 6
            </div>
          </div>
          {
            <div className={styles.loaderStyles}>
              <PulsingDots color={'pink'} />
            </div>
          }
        </div>
        <div
          className={`${styles.arrow} ${styles.freezedArrow}`}
        >
          <FaArrowRight size={30} />
        </div>
      </div>
    )
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
  return (
    <Navigate to={`/drips/poll/${firstUnansweredIndex + 1}`} />
  )
}

export default PollsRedirect