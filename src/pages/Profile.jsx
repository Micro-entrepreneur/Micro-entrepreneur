import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <div>로그인이 필요합니다.</div>;

  return (
    <div>
      <h1>{user.user_metadata?.name}님 환영합니다!</h1>
      <p>이메일: {user.email}</p>
    </div>
  );
};

export default Profile;
