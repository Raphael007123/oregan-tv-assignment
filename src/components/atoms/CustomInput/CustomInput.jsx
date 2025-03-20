// UIInput.jsx
import React, { useState, useEffect, useRef } from "react";
import InputTypes from "@constants/InputTypes";
import PasswordToggle from "@components/atoms/PasswordToggle/PasswordToggle";
import Caret from "../Caret/Caret";

const MASK_DELAY = 1500;

function UIInput({
    type = InputTypes.text,
    value,
    placeholder = "",
    autoFocus = false,
    isActiveElement = false,
    onKeyDown,
    onClick,
    maskPassword = true,
    focusToggle,
    toggleRef,
}) {
    const [focused, setFocused] = useState(false);
    const containerRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);
    // For password: track index and timestamp of the last character entered
    const [lastTypedIndex, setLastTypedIndex] = useState(null);
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (autoFocus && containerRef.current) {
            containerRef.current.focus();
        }
    }, [autoFocus]);

    // When value updates in password mode, detect if a new char was appended
    useEffect(() => {
        if (type === "password" && maskPassword) {
            if (value.length > prevValueRef.current.length) {
                // record index and timestamp for the newly entered character
                setLastTypedIndex(value.length - 1);
            }
            prevValueRef.current = value;
        }
    }, [value, type, maskPassword]);

    // Set timeout to mask the last typed character after the delay
    useEffect(() => {
        let timer;
        if (lastTypedIndex !== null) {
            timer = setTimeout(() => {
                setLastTypedIndex(null);
            }, MASK_DELAY);
        }
        return () => clearTimeout(timer);
    }, [lastTypedIndex]);

    useEffect(() => {
        if (!containerRef.current) return;
        const scrollToEnd = () => {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        };
        const animationFrame = requestAnimationFrame(scrollToEnd);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, type]);

    const renderDisplay = () => {
        if (type === InputTypes.password && !isRevealed) {
            return value.split("").map((char, idx) => {
                if (idx === lastTypedIndex) {
                    return <span key={idx}>{char}</span>;
                } else {
                    return <span key={idx}>*</span>;
                }
            });
        } else {
            return value;
        }
    };

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    const revealInput = () => {
        setIsRevealed(true);
        setTimeout(() => {
            setIsRevealed(false);
        }, 2000);
    };

    return (
        <div className="flex-row center w-full">
            <div
                ref={containerRef}
                className="custom-input flex-row w-full"
                // Only the active element gets tabIndex 0; others get -1
                tabIndex={isActiveElement ? 0 : -1}
                role="textbox"
                aria-label={placeholder}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={onClick}
                onKeyDown={onKeyDown}
                style={{
                    border: isActiveElement ? "2px solid #f9cb9c" : "1px solid black",
                }}
            >
                {value.length === 0 && !focused ? (
                    <>
                        {isActiveElement && <Caret />}
                        <span className="placeholder">
                            <i>{placeholder}</i>
                        </span>
                    </>
                ) : (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {renderDisplay()}
                        {(focused || isActiveElement) && <Caret />}
                    </div>
                )}
            </div>
            {type === InputTypes.password && (
                <PasswordToggle
                    ref={toggleRef}
                    focusToggle={focusToggle}
                    isRevealed={isRevealed}
                    onToggle={revealInput}
                    // Pass along the focus state so the toggle button is only focusable when active.
                    isActiveElement={isActiveElement /* set this from the parent if needed */}
                />
            )}
        </div>
    );
}

export default UIInput;
