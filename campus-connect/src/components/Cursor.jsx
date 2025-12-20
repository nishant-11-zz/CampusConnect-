import React, { useEffect, useRef } from 'react';

const Cursor = () => {
    const dotRef = useRef(null);

    useEffect(() => {
        const dot = dotRef.current;

        if (!dot) return;

        // Mouse Move
        const onMouseMove = (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            dot.style.left = `${posX}px`;
            dot.style.top = `${posY}px`;
        };

        // Hover Effects
        const onMouseEnter = () => document.body.classList.add('hovering');
        const onMouseLeave = () => document.body.classList.remove('hovering');

        window.addEventListener('mousemove', onMouseMove);

        // Attach hover listeners to interactive elements
        // We use delegation or periodic check, or simpler: global event listener for mouseover
        const handleMouseOver = (e) => {
            if (e.target.closest('a, button, input, textarea, .dropdown-toggle')) {
                document.body.classList.add('hovering');
            } else {
                document.body.classList.remove('hovering');
            }
        };

        // Use global mouseover for dynamic elements
        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
            document.body.classList.remove('hovering');
        };
    }, []);

    return (
        <>
            <div className="cursor-dot" ref={dotRef}></div>
        </>
    );
};

export default Cursor;
