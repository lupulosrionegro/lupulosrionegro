import React from "react";

interface PlantState {
  isDay: boolean;
  temperature: number | null;
  ambientHumidity: number | null;
  isRaining: boolean;
}

interface HopFieldSVGProps {
  plantStates: PlantState[];
}

const HopFieldSVG: React.FC<HopFieldSVGProps> = ({ plantStates }) => {
  const getPlantAppearance = (plant: PlantState) => {
    const { temperature, ambientHumidity, isRaining } = plant;

    // Cold conditions
    if (temperature !== null && temperature < 5) {
      return "cold";
    }

    // Hot conditions
    if (temperature !== null && temperature > 30) {
      return "hot";
    }

    // Ideal conditions (example range)
    if (temperature !== null && temperature >= 20 && temperature <= 30 && ambientHumidity !== null && ambientHumidity > 60) {
      return "ideal";
    }

    // Raining conditions
    if (isRaining) {
      return "raining";
    }

    return "normal";
  };

  const plantPositions = [
    { x: 275, y: 290, eyeY: 110, leafYOffset: 0 }, // Planta 1 (centralizada)
  ];

  return (
    <svg viewBox="0 0 600 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect x="0" y="0" width="600" height="300" fill="#eaf6ff" />


      {plantPositions.map((pos, index) => {
        const state = plantStates[index] || { isDay: true, temperature: null, ambientHumidity: null, isRaining: false };
        const plantX = pos.x;
        const plantY = pos.y;
        const eyeY = pos.eyeY;
        const leafYOffset = pos.leafYOffset;
        const appearance = getPlantAppearance(state);

        return (
          <g key={index}>
            {appearance === "cold" && index === 0 ? (
              // Special cold plant (mate drinker)
              <g>
                <rect x={plantX - 10} y={plantY - 150} width="40" height="150" fill="lightblue" opacity="0.7" /> {/* Ice cube */}
                <path d={`M${plantX} ${plantY} Q${plantX + 5} ${plantY - 60} ${plantX + 15} ${plantY - 120} Q${plantX + 20} ${plantY - 140} ${plantX} ${plantY - 190}`} stroke="#2E8B57" strokeWidth="3" fill="none" />
                {/* Mate */}
                <circle cx={plantX + 25} cy={eyeY + 30} r="8" fill="brown" />
                <rect x={plantX + 23} y={eyeY + 20} width="4" height="15" fill="silver" />
                {/* Ojos abiertos para la que toma mate */}
                <circle cx={plantX + 5} cy={eyeY} r="5" fill="black" />
                <circle cx={plantX + 15} cy={eyeY} r="5" fill="black" />
                <circle cx={plantX + 6.5} cy={eyeY - 1.5} r="1" fill="white" />
                <circle cx={plantX + 16.5} cy={eyeY - 1.5} r="1" fill="white" />
              </g>
            ) : appearance === "cold" ? (
              // Regular cold plant (ice cube)
              <rect x={plantX - 10} y={plantY - 150} width="40" height="150" fill="lightblue" opacity="0.7" />
            ) : appearance === "hot" ? (
              // Melted plant with floaties
              <g>
                <path d={`M${plantX} ${plantY} Q${plantX + 5} ${plantY - 30} ${plantX + 15} ${plantY - 60} Q${plantX + 20} ${plantY - 70} ${plantX} ${plantY - 90}`} stroke="#FFD700" strokeWidth="3" fill="none" /> {/* Melted shape */}
                <ellipse cx={plantX + 5} cy={plantY - 20} rx="15" ry="5" fill="orange" opacity="0.6" /> {/* Floatie */}
                <ellipse cx={plantX + 15} cy={plantY - 40} rx="15" ry="5" fill="orange" opacity="0.6" /> {/* Floatie */}
                {/* Ojos */}
                {state.isDay ? (
                  <>
                    <circle cx={plantX + 5} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 15} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 6.5} cy={eyeY - 1.5} r="1" fill="white" />
                    <circle cx={plantX + 16.5} cy={eyeY - 1.5} r="1" fill="white" />
                  </>
                ) : (
                  <>
                    <path d={`M${plantX + 2} ${eyeY} Q${plantX + 5} ${eyeY + 3} ${plantX + 8} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                    <path d={`M${plantX + 12} ${eyeY} Q${plantX + 15} ${eyeY + 3} ${plantX + 18} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                  </>
                )}
              </g>
            ) : appearance === "ideal" ? (
              // Ideal conditions plant (glasses, cigarette, beer)
              <g>
                <path d={`M${plantX} ${plantY} Q${plantX + 5} ${plantY - 60} ${plantX + 15} ${plantY - 120} Q${plantX + 20} ${plantY - 140} ${plantX} ${plantY - 190}`} stroke="#2E8B57" strokeWidth="3" fill="none" />
                {/* Glasses */}
                <rect x={plantX + 2} y={eyeY - 5} width="8" height="3" fill="gray" />
                <rect x={plantX + 12} y={eyeY - 5} width="8" height="3" fill="gray" />
                <line x1={plantX + 10} y1={eyeY - 3.5} x2={plantX + 12} y2={eyeY - 3.5} stroke="gray" strokeWidth="1" />
                {/* Cigarette */}
                <rect x={plantX + 18} y={eyeY + 5} width="10" height="2" fill="white" />
                <rect x={plantX + 28} y={eyeY + 5} width="2" height="2" fill="orange" />
                {/* Beer */}
                <rect x={plantX - 5} y={eyeY + 10} width="8" height="15" fill="gold" stroke="black" strokeWidth="0.5" />
                {/* Ojos */}
                {state.isDay ? (
                  <>
                    <circle cx={plantX + 5} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 15} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 6.5} cy={eyeY - 1.5} r="1" fill="white" />
                    <circle cx={plantX + 16.5} cy={eyeY - 1.5} r="1" fill="white" />
                  </>
                ) : (
                  <>
                    <path d={`M${plantX + 2} ${eyeY} Q${plantX + 5} ${eyeY + 3} ${plantX + 8} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                    <path d={`M${plantX + 12} ${eyeY} Q${plantX + 15} ${eyeY + 3} ${plantX + 18} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                  </>
                )}
              </g>
            ) : appearance === "raining" ? (
              // Raining plant (with umbrella)
              <g>
                <path d={`M${plantX} ${plantY} Q${plantX + 5} ${plantY - 60} ${plantX + 15} ${plantY - 120} Q${plantX + 20} ${plantY - 140} ${plantX} ${plantY - 190}`} stroke="#2E8B57" strokeWidth="3" fill="none" />
                {/* Umbrella */}
                <path d={`M${plantX - 10} ${eyeY - 20} Q${plantX + 10} ${eyeY - 40} ${plantX + 30} ${eyeY - 20}`} fill="#87CEEB" />
                <line x1={plantX + 10} y1={eyeY - 20} x2={plantX + 10} y2={eyeY + 5} stroke="black" strokeWidth="1" />
                {/* Ojos */}
                {state.isDay ? (
                  <>
                    <circle cx={plantX + 5} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 15} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 6.5} cy={eyeY - 1.5} r="1" fill="white" />
                    <circle cx={plantX + 16.5} cy={eyeY - 1.5} r="1" fill="white" />
                  </>
                ) : (
                  <>
                    <path d={`M${plantX + 2} ${eyeY} Q${plantX + 5} ${eyeY + 3} ${plantX + 8} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                    <path d={`M${plantX + 12} ${eyeY} Q${plantX + 15} ${eyeY + 3} ${plantX + 18} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                  </>
                )}
              </g>
            ) : (
              // Normal plant
              <g>
                <path d={`M${plantX} ${plantY} Q${plantX + 5} ${plantY - 60} ${plantX + 15} ${plantY - 120} Q${plantX + 20} ${plantY - 140} ${plantX} ${plantY - 190}`} stroke="#2E8B57" strokeWidth="3" fill="none" />
                {/* Ojos */}
                {state.isDay ? (
                  <>
                    <circle cx={plantX + 5} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 15} cy={eyeY} r="5" fill="black" />
                    <circle cx={plantX + 6.5} cy={eyeY - 1.5} r="1" fill="white" />
                    <circle cx={plantX + 16.5} cy={eyeY - 1.5} r="1" fill="white" />
                  </>
                ) : (
                  <>
                    <path d={`M${plantX + 2} ${eyeY} Q${plantX + 5} ${eyeY + 3} ${plantX + 8} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                    <path d={`M${plantX + 12} ${eyeY} Q${plantX + 15} ${eyeY + 3} ${plantX + 18} ${eyeY}`} stroke="black" strokeWidth="2" fill="none" />
                  </>
                )}
              </g>
            )}

            {/* Boca */}
            {state.isDay && appearance !== "cold" && appearance !== "hot" && appearance !== "raining" && (
              <path d={`M${plantX + 5} ${eyeY + 10} Q${plantX + 10} ${eyeY + 15} ${plantX + 15} ${eyeY + 10}`} stroke="black" strokeWidth="1.5" fill="none" />
            )}
            {appearance === "hot" && (
              <path d={`M${plantX + 5} ${eyeY + 10} L${plantX + 15} ${eyeY + 10}`} stroke="black" strokeWidth="1.5" fill="none" />
            )}
            {appearance === "raining" && (
              <path d={`M${plantX + 5} ${eyeY + 10} Q${plantX + 10} ${eyeY + 5} ${plantX + 15} ${eyeY + 10}`} stroke="black" strokeWidth="1.5" fill="none" />
            )}

            {/* Hojas (siempre presentes a menos que sea un cubito de hielo completo) */}
            {appearance !== "cold" && (
              <>
                <ellipse cx={plantX + 5} cy={plantY - 60 + leafYOffset} rx="7" ry="12" fill="#3CB371" />
                <ellipse cx={plantX + 10} cy={plantY - 90 + leafYOffset} rx="6" ry="10" fill="#3CB371" />
                <ellipse cx={plantX + 15} cy={plantY - 120 + leafYOffset} rx="5" ry="8" fill="#3CB371" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default HopFieldSVG;