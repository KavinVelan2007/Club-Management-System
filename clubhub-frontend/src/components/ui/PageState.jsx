function PageState({ type = "loading", title, message, onRetry }) {
    return <div className={`page-state ${type}`}><h2>{title}</h2><p>{message}</p>{onRetry && <button onClick={onRetry}>Try again</button>}</div>;
}

export default PageState;
