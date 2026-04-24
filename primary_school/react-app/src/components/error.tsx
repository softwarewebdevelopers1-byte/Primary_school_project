import styles from "./error.module.css";
function ErrorPage() {
  return (
    <div className={styles.container}>
      <h1>{`404! Not Found`}</h1>
      <div className={styles.vibrate}></div>
    </div>
  );
}
export default ErrorPage;
