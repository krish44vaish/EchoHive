import React from 'react'
import styles from '../styles/Spinner.module.css'
import { Loader2 } from 'lucide-react'

const Spinner = () => {
  return (
    <div>
      <Loader2 className={styles.spinner}/>
    </div>
  )
}

export default Spinner