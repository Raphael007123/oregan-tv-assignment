import React, { forwardRef } from "react";
import { EyeIcon } from '@assets/icons/EyeIcon';
import { EyeSlashIcon } from '@assets/icons/EyeSlashIcon';

const PasswordToggle = forwardRef(({ focusToggle, isRevealed, onToggle, width = 35, height = 35 }, ref) => {

    return (
        <button ref={ref} className={`password-toggle ${focusToggle ? 'toggle-focus': ''}`} onClick={onToggle}>
            {!isRevealed ? <EyeIcon width={width} height={height} /> : <EyeSlashIcon width={width} height={height} />}
        </button>
    );
});

export default PasswordToggle;