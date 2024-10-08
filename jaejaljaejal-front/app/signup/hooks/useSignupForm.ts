// hooks/useSignupForm.ts
"use client";

import { useState } from "react";
import {
  evaluatePasswordStrength,
  getPasswordStrength,
  validateEmail,
  validateNickname,
} from "../utils/validation";
import { sendVerificationCode, startTimer } from "../utils/emailVerification";

export interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  nickname: string;
  gender: string;
  birthdate: string;
}

const useSignupForm = () => {
  const initialFormValues: FormValues = {
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    nickname: "",
    gender: "",
    birthdate: "",
  };

  const initialErrors = {
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    nickname: "",
    gender: "",
    birthdate: "",
    verificationCode: "",
  };

  const initialFeedback = {
    password: "",
    confirmPassword: "",
  };

  const initialFeedbackClass = {
    password: "",
    confirmPassword: "",
  };

  // ? 폼 상태
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [errors, setErrors] = useState(initialErrors);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [feedbackClass, setFeedbackClass] = useState(initialFeedbackClass);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // ? 이메일 인증 관련 상태
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [timer, setTimer] = useState<number>(180);
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>("");

  const handleSendVerificationCode = async () => {
    if (!isEmailValid) return;

    try {
      console.log("인증 요청 전송 중...");
      await sendVerificationCode(formValues.email); // 실제 서버 요청 주석 처리
      setIsEmailVerificationSent(true); // 강제로 상태 변경
      setShowVerificationInput(true);
      startTimer(180, setTimer, () => setTimer(0));
    } catch (error) {
      console.error("인증 요청 실패:", error);
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
  };

  const handleVerifyCode = () => {
    // ! 인증번호 검증 로직 추가 ( 백엔드 연동 필요)
    if (verificationCode === "정확한 인증번호") {
      // !  백엔드 연동에 따라 수정 필요
      console.log("인증 성공");
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        verificationCode: "인증번호가 일치하지 않습니다.",
      }));
    }
  };

  const handleAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreed(e.target.checked);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let newValues = { ...formValues, [name]: value };

    if (type === "date") {
      // Date 타입의 입력 값을 처리
      newValues = { ...formValues, [name]: value };
    } else if (name === "phoneNumber" || name === "birthdate") {
      // 숫자만 입력 가능하게 처리
      newValues = { ...formValues, [name]: value.replace(/[^0-9]/g, "") };
    } else if (name === "nickname") {
      // 닉네임 처리 및 유효성 검사
      newValues = {
        ...formValues,
        [name]: value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/g, ""),
      };
      validateNicknameValue(newValues[name]);
    } else if (name === "password") {
      // 비밀번호 처리 및 강도 검사
      handlePasswordChange(newValues[name]);
    } else if (name === "confirmPassword") {
      // 비밀번호 확인 처리
      validateConfirmPassword(newValues[name]);
    }

    // 최종적으로 상태 업데이트
    setFormValues(newValues);
  };

  const validateNicknameValue = (nickname: string) => {
    if (nickname.length < 2) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        nickname: "2~16자의 한글, 영문, 숫자만 사용해주세요.",
      }));
    } else if (!validateNickname(nickname)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        nickname: "사용할 수 없는 닉네임입니다.",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, nickname: "" }));
    }
  };

  const handlePasswordChange = (password: string) => {
    const score = evaluatePasswordStrength(password);
    const strength = getPasswordStrength(score);
    setFeedback({ ...feedback, password: `비밀번호 강도: ${strength}` });

    let feedbackColor = "";
    if (strength === "위험") feedbackColor = "text-red-500 font-semibold";
    if (strength === "보통") feedbackColor = "text-yellow-500 font-semibold";
    if (strength === "강력") feedbackColor = "text-green-500 font-semibold";
    setFeedbackClass({ ...feedbackClass, password: feedbackColor });

    validateConfirmPassword(formValues.confirmPassword, password);
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string = formValues.password
  ) => {
    if (confirmPassword !== password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "비밀번호가 일치하지 않습니다.",
      }));
      setFeedback((prevFeedback) => ({ ...prevFeedback, confirmPassword: "" }));
      setFeedbackClass((prevClasses) => ({
        ...prevClasses,
        confirmPassword: "text-red-500 font-semibold",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: "" }));
      setFeedback((prevFeedback) => ({
        ...prevFeedback,
        confirmPassword: "비밀번호가 일치합니다.",
      }));
      setFeedbackClass((prevClasses) => ({
        ...prevClasses,
        confirmPassword: "text-green-500 font-semibold",
      }));
    }
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      if (!validateEmail(value)) {
        setErrors({ ...errors, email: "유효한 이메일 주소를 입력해주세요." });
        setIsEmailValid(false);
      } else {
        try {
          const response = await fetch(
            "https://2158-175-112-161-219.ngrok-free.app/email/check",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: value }),
            }
          );

          if (response.status === 200) {
            // 200 상태 코드일 경우 이메일 중복되지 않음
            setErrors({ ...errors, email: "" });
            setIsEmailValid(true);
          } else if (response.status === 409) {
            // 409 상태 코드일 경우 이메일이 중복됨
            setErrors({ ...errors, email: "이미 사용 중인 이메일입니다." });
            setIsEmailValid(false);
          } else {
            // 그 외 상태 코드 처리
            throw new Error(`서버 오류 발생: 상태 코드 ${response.status}`);
          }
        } catch (error) {
          console.error("Error checking email:", error);
          setErrors({
            ...errors,
            email: "이메일 중복 확인 중 오류가 발생했습니다.",
          });
          setIsEmailValid(false);
        }
      }
    } else if (name === "nickname") {
      validateNicknameValue(value);
    }
  };

  return {
    formValues,
    errors,
    feedback,
    feedbackClass,
    isEmailValid,
    agreed,
    isEmailVerificationSent,
    timer,
    showVerificationInput,
    verificationCode,
    handleInputChange,
    handleBlur,
    handleAgreeChange,
    handleSendVerificationCode,
    handleVerificationCodeChange,
    handleVerifyCode,
  };
};

export default useSignupForm;
