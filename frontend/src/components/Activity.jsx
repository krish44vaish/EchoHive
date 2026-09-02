import styles from '../styles/Activity.module.css'
import profileImage from '../assets/megan.png'
import { useQuery } from '@tanstack/react-query'
import { getActivity } from '../api/drips'
import moment from 'moment'
import Spinner from './Spinner'
import PulsingDots from './PulsingDots'

const Activity = () => {

    const { data: activities, isLoading, isError } = useQuery({
        queryKey: ['activity'],
        queryFn: getActivity,
    })
    return (
        <div className={styles.activityContainer}>
            {
                isLoading ?
                    <div className={styles.loaderStyles}>
                        <PulsingDots color={'pink'}/>
                    </div> :
                isError ?
                    (
                        <div style={{display:"flex",justifyContent:"center",placeItems:"center"}}>
                            <div>
                                <div className={styles.errorText}>
                                    Some Error Occurred...
                                </div>
                            </div>
                        </div>
                    ) :
                activities?.slice().reverse().map((activity) => {
                    return (
                        <div key={activity._id} className={styles.activity}>
                            <img src={activity.selectedOption.avatar || profileImage} alt="profile image" />
                            <div className={styles.activityRight}>
                                <div className={styles.activityTop}>
                                    <p><b>{activity.selectedOption.name}</b> Recieved</p>
                                    <p>{moment(activity.createdAt).fromNow()}</p>
                                </div>
                                <div className={styles.activityBottom}>
                                    {activity.questionId.text}
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Activity