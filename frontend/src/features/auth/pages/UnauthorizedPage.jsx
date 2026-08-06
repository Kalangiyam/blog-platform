import { ForbiddenState } from '../../permissions/index.js'

export default function UnauthorizedPage() {
  return (
    <ForbiddenState
      backText="Return home"
      backUrl="/"
      message="This area requires an application role that is not assigned to your account."
      title="Your account does not have access"
    />
  )
}
