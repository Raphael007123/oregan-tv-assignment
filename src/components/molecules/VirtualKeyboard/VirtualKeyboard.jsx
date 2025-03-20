import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const VirtualKeyboard = forwardRef(
  ({ onKeyPress: externalKeyPress, isActive, showPrev, showNext, onPrev, onNext }, ref) => {
    const [layoutName, setLayoutName] = useState("default");
    const containerRef = useRef(null);

    const handleShift = useCallback(() => {
      setLayoutName((prevLayout) => (prevLayout === "default" ? "shift" : "default"));
    }, []);

    const handleNumbers = useCallback(() => {
      setLayoutName((prevLayout) => (prevLayout === "default" ? "numbers" : "default"));
    }, []);

    const onKeyPress = useCallback(
      (button) => {
        // Handle custom navigation keys first
        if (button === "{prev}") {
          if (onPrev) onPrev();
          return;
        }
        if (button === "{next}") {
          if (onNext) onNext();
          return;
        }
        if (button === "{shift}" || button === "{lock}") {
          handleShift();
          return;
        }
        if (button === "{numbers}" || button === "{abc}") {
          handleNumbers();
          return;
        }
        if (button === "{specials}") {
          setLayoutName("specials");
          return;
        }
        if (externalKeyPress) externalKeyPress(button);
      },
      [handleShift, handleNumbers, externalKeyPress, onNext, onPrev]
    );

    // Base layouts for the keyboard (without navigation row)
    const baseLayout = {
      default: [
        "0 1 2 3 4 5 6 7 8 9",
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{shift} z x c v b n m {backspace}",
        "{specials} {space} {ent}",
        "@ .com @gmail.com @yahoo.com",
      ],
      shift: [
        "0 1 2 3 4 5 6 7 8 9",
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "{shift} Z X C V B N M {backspace}",
        "{specials} {space} {ent}",
        "@ .com @gmail.com @yahoo.com",
      ],
      specials: [
        " ~ ! @ # $ % ^ & *",
        "( ) - _ = + [ ] { }",
        "\\ | ; : ' \" , . < >",
        "/ ? £ € ¥ ₹ ° © ™ ¢",
        "{abc} {backspace}"
      ]
    };

    // Construct the navigation row from passed flags.
    let navRow = "";
    if (showPrev && showNext) {
      navRow = "{prev} {next}";
    } else if (showNext) {
      navRow = "{next}";
    } else if (showPrev) {
      navRow = "{prev}";
    }

    // Merge the base layout with the navigation row if navRow exists.
    const mergedLayout = {
      ...baseLayout,
      [layoutName]: navRow
        ? [navRow, ...baseLayout[layoutName]]
        : baseLayout[layoutName]
    };

    const display = {
      "{specials}": "!#$",
      "{numbers}": "123",
      "{ent}": "enter",
      "{backspace}": "⌫",
      "{capslock}": "caps lock ⇪",
      "{shift}": "⇧",
      "{abc}": "ABC",
      "{space}": "space",
      "{prev}": "prev",
      "{next}": "next"
    };

    // Expose a method to focus the first key
    useImperativeHandle(ref, () => ({
      focusFirstKey: () => {
        if (containerRef.current) {
          const keys = containerRef.current.querySelectorAll(".hg-button");
          if (keys.length > 0) {
            keys[0].focus();
          }
        }
      }
    }));

    // for handling focus is always and the end of input
    useEffect(() => {
      if (containerRef.current) {
        const keys = containerRef.current.querySelectorAll(".hg-button");
        keys.forEach((key) => {
          key.tabIndex = isActive ? 0 : -1;
        });
        if (isActive && keys.length > 0 && !containerRef.current.contains(document.activeElement)) {
          keys[0].focus();
        }
      }
    }, [layoutName, isActive, mergedLayout]);

    // for handling the focus navigation through keyboard
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          const focusedKey = document.activeElement;
          if (focusedKey && focusedKey.classList.contains("hg-button")) {
            const buttonValue = focusedKey.getAttribute("data-skbtn");
            if (buttonValue) {
              onKeyPress(buttonValue);
            }
            e.preventDefault();
            return;
          }
        }

        const rows = container.querySelectorAll(".hg-row");
        if (!rows || rows.length === 0) return;

        let currentRowIndex = -1;
        let currentColIndex = -1;

        rows.forEach((row, rowIndex) => {
          const keys = row.querySelectorAll(".hg-button");
          keys.forEach((key, colIndex) => {
            if (document.activeElement === key) {
              currentRowIndex = rowIndex;
              currentColIndex = colIndex;
            }
          });
        });

        if (currentRowIndex === -1) {
          rows[0].querySelector(".hg-button").focus();
          return;
        }

        let targetRow = currentRowIndex;
        let targetCol = currentColIndex;

        if (e.key === "ArrowRight") {
          const keys = rows[currentRowIndex].querySelectorAll(".hg-button");
          targetCol = (currentColIndex + 1) % keys.length;
        } else if (e.key === "ArrowLeft") {
          const keys = rows[currentRowIndex].querySelectorAll(".hg-button");
          targetCol = (currentColIndex - 1 + keys.length) % keys.length;
        } else if (e.key === "ArrowDown") {
          targetRow = (currentRowIndex + 1) % rows.length;
          const keys = rows[targetRow].querySelectorAll(".hg-button");
          targetCol = Math.min(currentColIndex, keys.length - 1);
        } else if (e.key === "ArrowUp") {
          targetRow = (currentRowIndex - 1 + rows.length) % rows.length;
          const keys = rows[targetRow].querySelectorAll(".hg-button");
          targetCol = Math.min(currentColIndex, keys.length - 1);
        } else {
          return;
        }

        const targetKeys = rows[targetRow].querySelectorAll(".hg-button");
        if (targetKeys && targetKeys[targetCol]) {
          targetKeys[targetCol].focus();
          e.preventDefault();
        }
      };

      container.addEventListener("keydown", handleKeyDown);
      return () => container.removeEventListener("keydown", handleKeyDown);
    }, [layoutName, onKeyPress]);

    return (
      <div ref={containerRef} className="virtual-keyboard">
        <Keyboard
          layoutName={layoutName}
          onKeyPress={onKeyPress}
          layout={mergedLayout}
          display={display}
          mergeDisplay={true}
        />
      </div>
    );
  }
);

export default React.memo(VirtualKeyboard);
