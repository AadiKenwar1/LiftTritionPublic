import React from "react";
import { Dimensions } from "react-native";
import Svg, {
  Polygon,
  G,
  Text as SvgText,
  Circle,
  Line,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

export default function RadarChart({
  data,
  size, // Optional: chart size (width/height)
  levels = 4, // Number of grid levels (rings)
  scale = 0.35, // How much of container chart fills (0 to 1)
  labelOffsetFactor = 0.05, // Distance of labels beyond chart
}) {
  const { theme } = useTheme();

  // Pull colors from your theme (easy to manage global styling)
  const colors = {
    grid: theme.spiderChart, // Grid line color: white
    stroke: theme.spiderStroke, // Main polygon stroke: electric blue (#2D9CFF)
    fill: theme.spiderShade, // Polygon fill: rgba(45, 156, 255, 0.3)
    label: theme.textColor, // Label text color: white
  };

  // Responsive chart sizing based on device screen width
  const { width } = Dimensions.get("window");
  const chartSize = size || width * 0.85; // 90% width unless overridden

  // Calculated geometric dimensions
  const center = chartSize / 2;
  const radius = chartSize * scale; // Main chart radius
  const labelOffset = chartSize * labelOffsetFactor; // Label distance outside radius
  const dotRadius = chartSize * 0.015; // Size of data point dots
  const fontSize = data.length === 7 ? chartSize * 0.04 : chartSize * 0.05; // Label font size
  const lineSpacing = chartSize * 0.045; // Label line spacing

  const angleStep = (2 * Math.PI) / data.length; // Angular separation of axes

  // Calculate XY coordinates for each data value (scaled by score)
  const getDataPoints = () =>
    data.map((item, index) => {
      const value = Math.max(0.05, item.score / 100) * radius; // Avoid collapsing points for 0% scores
      const angle = index * angleStep - Math.PI / 2; // Start at top
      const x = center + value * Math.cos(angle);
      const y = center + value * Math.sin(angle);
      return { x, y };
    });

  const dataPoints = getDataPoints();

  // Render entire grid: rings and spokes
  const renderGrid = () => {
    const elements = [];

    // Render concentric polygon rings
    for (let level = 1; level <= levels; level++) {
      const r = (level / levels) * radius;

      const points = data
        .map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return `${x},${y}`;
        })
        .join(" ");

      elements.push(
        <Polygon
          key={`grid-${level}`}
          points={points}
          stroke={colors.grid}
          fill="none"
          strokeWidth={level === levels ? 1.5 : 1} // Outer ring slightly thicker
          opacity={level === levels ? 1 : 0.15} // Inner rings faint for visual balance
        />,
      );
    }

    // Render radial spokes from center to outer edges
    for (let i = 0; i < data.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      elements.push(
        <Line
          key={`spoke-${i}`}
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke={colors.grid}
          strokeWidth={0.6}
          opacity={0.12} // very faint spokes for modern minimal look
        />,
      );
    }

    return elements;
  };

  // Render labels at end of each axis
  const renderLabels = () =>
    data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + labelOffset + (data.length === 7 ? 3 : 0);
      const x = center + labelRadius * Math.cos(angle) * 1.1;
      const y =
        center + labelRadius * Math.sin(angle) + (data.length === 7 ? -1 : 3);

      // Apply both vertical + horizontal correction
      const adjustmentFactor = 0.35;
      const verticalAdjustment =
        Math.sin(angle) * fontSize * adjustmentFactor + 2;
      const horizontalAdjustment =
        Math.cos(angle) * fontSize * adjustmentFactor;

      const lines = item.name.split("\n");

      return (
        <G key={`label-${index}`}>
          {lines.map((line, lineIndex) => (
            <SvgText
              key={`${index}-${lineIndex}`}
              x={x + horizontalAdjustment}
              y={y + lineIndex * lineSpacing + verticalAdjustment - 1}
              fontSize={fontSize * 1.0}
              fontWeight="300"
              textAnchor="middle"
              fill={colors.label}
            >
              {line}
            </SvgText>
          ))}
        </G>
      );
    });

  // Render main filled polygon for data
  const renderDataShape = () => {
    const pathData =
      dataPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ") + " Z";

    return (
      <Path
        d={pathData}
        fill="url(#fillGradient)" // Gradient fill applied
        stroke={colors.stroke} // Blue outer stroke
        strokeWidth={2.5}
        strokeLinejoin="round"
        opacity={0.9}
      />
    );
  };

  // Render dots for each data point
  const renderDataPoints = () =>
    dataPoints.map((p, index) => (
      <G key={`point-${index}`}>
        {/* Glow behind dot */}
        <Circle
          cx={p.x}
          cy={p.y}
          r={dotRadius * 1.5}
          fill={colors.stroke}
          opacity={0.15}
        />
        {/* Actual data point */}
        <Circle
          cx={p.x}
          cy={p.y}
          r={dotRadius}
          fill={colors.stroke}
          stroke={colors.grid}
          strokeWidth={0.8}
        />
      </G>
    ));

  return (
    <Svg
      viewBox={`0 0 ${chartSize} ${chartSize}`}
      width="100%"
      height={chartSize}
    >
      <Defs>
        {/* Soft radial gradient fill for polygon area */}
        <RadialGradient id="fillGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={colors.stroke} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={colors.fill} stopOpacity="0.2" />
        </RadialGradient>
      </Defs>

      <G>
        {renderGrid()}

        {renderDataShape()}

        {renderDataPoints()}

        {renderLabels()}
      </G>
    </Svg>
  );
}
