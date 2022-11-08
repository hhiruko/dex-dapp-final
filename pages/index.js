import styles from '../styles/Home.module.css'
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (

    <main className={styles.main} style={{ 
      backgroundImage: 'url("bg_home.jpg")'
    }}>
        
      <h1 className={styles.title}>
        Welcome to SSSnake Swap!
      </h1>

      <p className={styles.paragraph}>
        Swap crypto on the most popular decentralized platform in the galaxy.
      </p>

      <div
        className={styles.button}
        role="button"
        onClick={() => router.push(`/signin`)}
      >
        <center><h2 className={styles.buttonText}>Connect with Your Wallet!</h2></center>
      </div>

    </main>
  )
}
