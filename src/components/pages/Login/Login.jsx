import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import InputTypes from "@constants/InputTypes";
import CustomInput from "@components/atoms/CustomInput/CustomInput";
import VirtualKeyboard from "@components/molecules/VirtualKeyboard/VirtualKeyboard";

function LoginPage() {
    const [focusedField, setFocusedField] = useState("username");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { t } = useTranslation();
    const keyboardRef = useRef(null);
    const passwordToggleRef = useRef(null);

    // Determine navigation button visibility based on focus.
    const showPrev = focusedField !== "username"; // Hide prev on username.
    const showNext = true; //always show next

    // Callback when navigation next is pressed
    const handleNext = useCallback(() => {
        if (focusedField === "username") {
            setFocusedField("password");
            setTimeout(() => {
                keyboardRef.current?.focusFirstKey();
            }, 0);
        } else if (focusedField === "password") {
            setFocusedField("toggle");
        } else if (focusedField === "toggle") {
            handleSubmit();
        }
    }, [focusedField]);

    // Callback when navigation prev is pressed
    const handlePrev = useCallback(() => {
        if (focusedField === "toggle") {
            setFocusedField("password");
        } else if (focusedField === "password") {
            setFocusedField("username");
        }
        setTimeout(() => {
            keyboardRef.current?.focusFirstKey();
        }, 0);
    }, [focusedField]);

    // Handle key presses from the Virtual Keyboard (for character entry)
    const handleKeyPressFromOSK = useCallback(
        (key) => {
            if (key === "{backspace}") {
                if (focusedField === "username") {
                    setUsername((prev) => prev.slice(0, -1));
                } else if (focusedField === "password") {
                    setPassword((prev) => prev.slice(0, -1));
                }
            } else if (key === "{ent}") {
                if (focusedField === 'toggle') {
                    passwordToggleRef.current?.click()
                } else
                    handleNext();
            } else if (
                key === "{shift}" ||
                key === "{lock}" ||
                key === "{numbers}" ||
                key === "{abc}" ||
                key === "{space}"
            ) {
                return;
            } else {
                if (focusedField === "username") {
                    setUsername((prev) => prev + key);
                } else if (focusedField === "password") {
                    setPassword((prev) => prev + key);
                }
            }
        },
        [focusedField, handleNext]
    );

    const handleInputKeyDown = useCallback(
        (e) => {
            if (e.key === "ArrowDown") {
                if (focusedField === "username") {
                    setFocusedField("password");
                    setTimeout(() => {
                        keyboardRef.current?.focusFirstKey();
                    }, 0);
                }
            } else if (e.key === "ArrowUp") {
                if (focusedField === "password") {
                    setFocusedField("username");
                    setTimeout(() => {
                        keyboardRef.current?.focusFirstKey();
                    }, 0);
                }
            }
        },
        [focusedField]
    );

    const handleSubmit = () => {
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }
        console.log("Submitted credentials:", { username, password });
        alert("Submitted!");
    };

    return (
        <div className="login-page">
            <h1 className="heading">{t("login.title")}</h1>
            <div className="login-form">
                <div className="input-wrapper">
                    <CustomInput
                        type={InputTypes.text}
                        name="username"
                        isActiveElement={focusedField === "username"}
                        value={username}
                        onChange={setUsername}
                        placeholder={t("login.username_placeholder")}
                        autoFocus={focusedField === "username"}
                        onKeyDown={handleInputKeyDown}
                        onClick={() => { setFocusedField('username'); keyboardRef.current?.focusFirstKey(); }}
                    />
                </div>
                <div className="input-wrapper">
                    <CustomInput
                        type={InputTypes.password}
                        name="password"
                        isActiveElement={focusedField === "password"}
                        value={password}
                        autoFocus={focusedField === "password"}
                        onChange={setPassword}
                        placeholder={t("login.password_placeholder")}
                        onKeyDown={handleInputKeyDown}
                        focusToggle={focusedField === "toggle"}
                        toggleRef={passwordToggleRef}
                        onClick={() => { setFocusedField('password'); keyboardRef.current?.focusFirstKey() }}
                    />
                </div>
                <div className="button-wrapper flex-column center">
                    <button onClick={handleSubmit} className="sign-in-btn" disabled={!username || !password}>
                        {t("login.sign_in")}
                    </button>
                </div>
                <div>
                    <VirtualKeyboard
                        ref={keyboardRef}
                        onKeyPress={handleKeyPressFromOSK}
                        isActive={true}
                        showPrev={showPrev}
                        showNext={showNext}
                        onPrev={handlePrev}
                        onNext={handleNext}
                    />
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
