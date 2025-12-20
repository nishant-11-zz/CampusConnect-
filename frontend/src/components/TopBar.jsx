import React, { useState } from 'react';

const TopBar = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const performSearch = () => {
        if (searchQuery.trim()) {
            window.open(`https://www.google.com/search?q=site:mmmut.ac.in ${encodeURIComponent(searchQuery)}`, '_blank');
            setSearchQuery('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    return (
        <div id="top-bar">
            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="search"
                    id="search-bar"
                    placeholder="Search site..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyUp={handleKeyPress}
                />
                <button
                    id="search-button"
                    aria-label="Search"
                    onClick={performSearch}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.7422 10.3438H10.9531L10.6797 10.0859C11.6562 9.01562 12.25 7.60156 12.25 6.125C12.25 2.73828 9.51172 0 6.125 0C2.73828 0 0 2.73828 0 6.125C0 9.51172 2.73828 12.25 6.125 12.25C7.60156 12.25 9.01562 11.6562 10.0859 10.6797L10.3438 10.9531V11.7422L15 16L16 15L11.7422 10.3438ZM6.125 10.3438C3.78125 10.3438 1.90625 8.46875 1.90625 6.125C1.90625 3.78125 3.78125 1.90625 6.125 1.90625C8.46875 1.90625 10.3438 3.78125 10.3438 6.125C10.3438 8.46875 8.46875 10.3438 6.125 10.3438Z" fill="currentColor" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default TopBar;
