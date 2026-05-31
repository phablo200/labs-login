import { Link } from 'react-router-dom'
import { AppRoute } from '../../routes/routes.enum'

function HomePage() {
  return (
    <main className="route-page" aria-labelledby="home-title">
      <p className="route-eyebrow">MeLogin</p>
      <h1 id="home-title">Home</h1>
      <p className="route-copy">
        Minimal home placeholder. Protected session behavior is deferred until
        the session abstraction is implemented.
      </p>
      <nav className="route-links" aria-label="Home related pages">
        <Link to={AppRoute.SignIn}>Sign in</Link>
        <Link to={AppRoute.SignUp}>Sign up</Link>
      </nav>
    </main>
  )
}

export default HomePage
