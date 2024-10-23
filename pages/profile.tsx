import UserProfile from '../app/components/UserProfile';
import { ProtectedRoute } from '../components/ProtectedRoute';

function ProfilePage() {
  return <UserProfile />;
}

export default ProtectedRoute(ProfilePage);