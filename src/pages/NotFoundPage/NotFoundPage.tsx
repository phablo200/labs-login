import { Link } from 'react-router-dom'
import { AppRoute } from '../../routes/routes.enum'

function NotFoundPage() {
  return (
    <main className="route-page" aria-labelledby="not-found-title">
      <p className="route-eyebrow">MeLogin</p>
      <h1 id="not-found-title">Page not found</h1>
      <p className="route-copy">
        The page you requested does not exist in this app.
      </p>
      <nav className="route-links" aria-label="Not found related pages">
        <Link to={AppRoute.SignIn}>Go to sign in</Link>
      </nav>
    </main>
  )
}

export default NotFoundPage
