interface FeelloButtonProps {
    onClick: () => void;
    label: string;
    variant?: 'primary' | 'secondary';
    className?: string;
}

export const FeelloButton = ({ onClick, label, variant = 'primary', className = '' }: FeelloButtonProps) => {
    // Colors
    const pink = "#c5267d";
    const white = "#f1efea";

    // Primary: Pink Fill, White Text
    // Secondary: Transparent Fill, White Stroke, White Text? Or White Fill?
    // Let's assume Secondary 'Règles' should be subtle.
    // Maybe Transparent with White Stroke.

    const isPrimary = variant === 'primary';

    // SVG Paths
    // Shape logic: Rotated 180 in original.
    // Original d: "M4.413,0,0,11.615,6.128,33.875l179.52-3.1,8.338-16.25L190.047,0Z"
    // transform="translate(328.582 848.613) rotate(180)"
    // Rotation 180 around center? 
    // Let's simplify and just use the path as provided in a group with the transform, or calculate the new points.
    // Easier to wrap in the same group structure provided.

    // ViewBox of provided SVG: 0 0 193.986 33.875
    // We want to scale this up.

    return (
        <button
            onClick={onClick}
            className={`feello-btn ${className}`}
            style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                position: 'relative',
                width: '240px', // Scaled up slightly from 193
                height: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center', // Center content
                transition: 'transform 0.1s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            <svg
                viewBox="0 0 193.986 33.875"
                width="100%"
                height="100%"
                style={{ overflow: 'visible' }} // Allow text to flow? No, viewBox limits.
            >
                <g transform="translate(-134.596 -814.738)">
                    {/* Button Shape */}
                    <path
                        d="M4.413,0,0,11.615,6.128,33.875l179.52-3.1,8.338-16.25L190.047,0Z"
                        transform="translate(328.582 848.613) rotate(180)"
                        fill={isPrimary ? pink : 'rgba(255,255,255,0.2)'}
                        stroke={!isPrimary ? white : 'none'}
                        strokeWidth={!isPrimary ? 1 : 0}
                    />

                    {/* Text */}
                    {/* Centered roughly. Original translate(225 816) */}
                    {/* 225 is roughly center x of (134 + 193/2 = 230). */}
                    {/* 816+24 = 840. Center y of bbox ~831. */}
                    <text
                        transform="translate(231.5 838)"
                        fill={white}
                        fontSize="14"
                        fontFamily="sans-serif"
                        fontWeight="800"
                        fontStyle="italic"
                        textAnchor="middle"
                        style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                    >
                        {label}
                    </text>

                    {/* Decoration Triangle? "Tracé 131" */}
                    {/* Check if user wants this. Included in "Groupe 393". */}
                    {isPrimary && (
                        <path
                            d="M3599.07,1486.229l8.9,7.614-8.9,7.614-1.021-2.112,7.39-5.283-8.365-6.35Z"
                            transform="translate(-3289.074 -662.167)"
                            fill={white}
                        />
                    )}
                </g>
            </svg>
        </button>
    );
};
