import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  //폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  //비밀번호 유효성 검사 상태
  const [passwordRules, setPasswordRules] = useState({
    isLengthValid: false,
    isComboValid: false,
  });

  // UI 상태 관리
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const value = formData.password;

    // 길이 검사
    const isLengthValid = value.length >= 8;

    // 대문자 + 소문자 + 숫자 검사
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const isComboValid = hasUpper && hasLower && hasNumber;

    setPasswordRules({ isLengthValid, isComboValid });
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 별명 중복확인 (간단한 유효성 검사만)
  const handleCheckNameDuplicate = () => {
    if (!formData.name.trim()) {
      alert('별명을 입력해주세요.');
      return;
    }

    if (formData.name.trim().length < 2) {
      alert('별명은 2자 이상 입력해주세요.');
      return;
    }

    if (formData.name.trim().length > 20) {
      alert('별명은 20자 이하로 입력해주세요.');
      return;
    }

    // 특수문자 검사
    const nameRegex = /^[a-zA-Z0-9가-힣_]+$/;
    if (!nameRegex.test(formData.name.trim())) {
      alert('별명은 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.');
      return;
    }

    alert('사용 가능한 별명입니다.');
  };

  // 이메일 중복확인 (형식 검사만)
  const handleCheckEmailDuplicate = () => {
    if (!formData.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    alert('사용 가능한 이메일 형식입니다.\n(실제 중복 여부는 가입 시 확인됩니다)');
  };

  //이전 페이지로 이동
  const handleCancel = () => {
    navigate(-1);
  };

  // 회원가입 처리
  const handleSignUp = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // 입력값 검증
    if (!formData.name.trim()) {
      setError('별명을 입력해주세요.');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('별명은 2자 이상 입력해주세요.');
      return;
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검증
    if (!passwordRules.isLengthValid || !passwordRules.isComboValid) {
      setError('비밀번호 규칙을 확인해주세요. (8자 이상, 대문자/소문자/숫자 포함)');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Supabase 클라이언트 확인
      if (!supabase) {
        setError('Supabase가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
        setLoading(false);
        return;
      }

      // Supabase 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password.trim(),
        options: {
          data: {
            name: formData.name.trim(), // 사용자 메타데이터에 별명 저장
          },
        },
      });

      if (signUpError) {
        console.error('Supabase 회원가입 오류:', signUpError);

        // 에러 메시지 처리
        let errorMessage = '회원가입에 실패했습니다.';
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          errorMessage = '이미 등록된 이메일입니다.';
        } else if (signUpError.message.includes('Invalid email')) {
          errorMessage = '올바른 이메일 형식을 입력해주세요.';
        } else if (signUpError.message.includes('Password')) {
          errorMessage = signUpError.message;
        } else {
          errorMessage = signUpError.message || errorMessage;
        }

        setError(errorMessage);
        return;
      }

      // 회원가입 성공 시 처리
      console.log('회원가입 성공:', data);

      // 이메일 인증이 필요한 경우 (data.session이 없는 경우)
      if (data.user && !data.session) {
        setError('');
        alert('회원가입이 완료되었습니다!\n\n이메일 인증 링크를 발송했습니다.\n가입하신 이메일을 확인하여 인증을 완료해주세요.\n\n(스팸함도 확인해주세요)');
        navigate('/login');
      } else if (data.session) {
        // 자동 로그인된 경우 (이메일 인증 비활성화 시)
        alert('회원가입 및 로그인이 완료되었습니다!');

        // 사용자 정보 저장
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('last_login_provider', 'email');
        }

        navigate('/');
      } else {
        // 예상치 못한 경우
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError('회원가입에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 표시/숨김 토글
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // 비밀번호 확인 표시/숨김 토글
  const handleTogglePasswordConfirm = () => {
    setShowPasswordConfirm((prev) => !prev);
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">회원가입</h1>

      {/* 별명 입력 */}
      <div className="input-group">
        <label className="input-label">별명</label>
        <button className="duplicate-check-btn" onClick={handleCheckNameDuplicate} type="button">
          중복확인
        </button>
        <input type="text" name="name" placeholder="사용할 별명을 입력하세요" value={formData.name} onChange={handleInputChange} className="name-input" />
      </div>

      {/* 이메일 입력 */}
      <div className="input-group">
        <label className="input-label">이메일</label>
        <button className="duplicate-check-btn" onClick={handleCheckEmailDuplicate} type="button">
          중복확인
        </button>
        <input type="email" name="email" placeholder="이메일을 입력하세요" value={formData.email} onChange={handleInputChange} className="name-input" />
      </div>

      {/* 비밀번호 입력 */}
      <div className="input-group">
        <label className="input-label">비밀번호</label>
        <div className="password-input-wrapper">
          <input type={showPassword ? 'text' : 'password'} name="password" placeholder="영문, 숫자 조합 8자 이상" value={formData.password} onChange={handleInputChange} className="name-input" />
          <button type="button" onClick={handleTogglePassword} className="toggle-password">
            <img src={showPassword ? '/img/EyeIcon.svg' : '/img/EyeOffIcon.svg'} alt="비밀번호 표시" />
          </button>
        </div>
      </div>

      {/* 비밀번호 확인 입력 */}
      <div className="input-group">
        <label className="input-label">비밀번호 확인</label>
        <div className="password-input-wrapper">
          <input type={showPasswordConfirm ? 'text' : 'password'} name="passwordConfirm" placeholder="비밀번호를 한 번 더 입력하세요" value={formData.passwordConfirm} onChange={handleInputChange} className="name-input" />
          <button type="button" onClick={handleTogglePasswordConfirm} className="toggle-password">
            <img src={showPasswordConfirm ? '/img/EyeIcon.svg' : '/img/EyeOffIcon.svg'} alt="비밀번호 확인 표시" />
          </button>
        </div>
      </div>

      {/* 비밀번호 규칙 */}
      <div className="password-rules">
        <div className="rule-item">
          <img src={passwordRules.isLengthValid ? '/img/CheckYesIcon.svg' : '/img/CheckNoIcon.svg'} alt="체크" />
          <span className={passwordRules.isLengthValid ? 'text-green' : 'text-gray'}>8자 이상</span>
        </div>
        <div className="rule-item">
          <img src={passwordRules.isComboValid ? '/img/CheckYesIcon.svg' : '/img/CheckNoIcon.svg'} alt="체크" />
          <span className={passwordRules.isComboValid ? 'text-green' : 'text-gray'}>대문자, 소문자, 숫자 포함</span>
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '5px',
            fontSize: '14px',
            marginTop: '1rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="button-group">
        <button onClick={handleCancel} className="cancel-btn" type="button" disabled={loading}>
          이전
        </button>
        <button onClick={handleSignUp} className="signup-btn" type="button" disabled={loading}>
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </div>
    </div>
  );
};

export default Register;
