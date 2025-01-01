import React, { useEffect, useState } from "react";
import { Box, Button, ButtonText, Select } from "@gluestack-ui/themed";
import {
  CartesianChart,
  Bar,
  useChartPressState,
} from "victory-native";
import { LinearGradient, Text as SKText, Circle, useFont, vec } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { ScrollView, useColorScheme } from "react-native";
import { COLORMODES } from "@gluestack-style/react/lib/typescript/types";
import { Picker } from '@react-native-picker/picker';

const inter = require("../../roboto.ttf");

// Generate data dynamically based on the range
const generateData = (range: "15days" | "1month" | "6months" | "1year") => {
  switch (range) {
    case "15days":
      return Array.from({ length: 15 }, (_, index) => ({
        label: `Day ${index + 1}`,
        hours: Math.floor(Math.random() * 8) + 1, // Random hours between 1-8
      }));
    case "1month":
      return Array.from({ length: 30 }, (_, index) => ({
        label: `Day ${index + 1}`,
        hours: Math.floor(Math.random() * 8) + 1,
      }));
    case "6months":
      return Array.from({ length: 6 }, (_, index) => ({
        label: `Mon ${index + 1}`,
        hours: Math.floor(Math.random() * 50) + 20, // Random hours between 20-50
      }));
    case "1year":
      return Array.from({ length: 12 }, (_, index) => ({
        label: `Mon ${index + 1}`,
        hours: Math.floor(Math.random() * 100) + 50, // Random hours between 50-100
      }));
    default:
      return [];
  }
};

export const BarChart = () => {
  const [range, setRange] = useState<"15days" | "1month" | "6months" | "1year">("15days");
  const [data, setData] = useState(generateData("15days"));

  useEffect(()=>{
    console.log(data)
  }, [data])

  const font = useFont(inter, 12);
  const toolTipFont = useFont(inter, 24);
  const colorMode = useColorScheme() as COLORMODES;
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { hours: 0 },
  });

  const isDark = colorMode === "dark";

  const value = useDerivedValue(() => {
    return state.y.hours.value.value + " hrs";
  }, [state]);

  const textYPosition = useDerivedValue(() => {
    return state.y.hours.position.value - 15;
  }, [value]);

  const textXPosition = useDerivedValue(() => {
    if (!toolTipFont) {
      return 0;
    }
    return (
      state.x.position.value - toolTipFont.measureText(value.value).width / 2
    );
  }, [value, toolTipFont]);

  const handleRangeChange = (selectedRange: "15days" | "1month" | "6months" | "1year") => {
    console.log(selectedRange, typeof (selectedRange))
    setRange(selectedRange);
    setData(generateData(selectedRange));
  };

  const calculateDomain = (data: any) => {
    const minHours = Math.min(...data.map((d: any) => d.hours));
    const maxHours = Math.max(...data.map((d: any) => d.hours));

    // Add padding to make the chart visually appealing
    const upperPadding = Math.ceil(maxHours * 0.1); // 10% padding
    const lowerPadding = Math.ceil(minHours * 0.1); // 10% padding

    return {
      y: [Math.max(0, minHours - lowerPadding), maxHours + upperPadding],
    };
  };

  return (
    <Box $dark-bg="$black" $light-bg="$white" flex={1} paddingHorizontal={5} paddingVertical={30}>
      <Box paddingBottom={20}>
        <Picker
          selectedValue={range}
          onValueChange={(value) => handleRangeChange(value)}
          style={{ height: 50, width: 150 }}
        >
          <Picker.Item label="Last 15 Days" value="15days" />
          <Picker.Item label="Last 1 Month" value="1month" />
          <Picker.Item label="Last 6 Months" value="6months" />
          <Picker.Item label="Last 1 Year" value="1year" />
        </Picker>
      </Box>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Box paddingTop={10} width={data.length * 80} height="80%">
          <CartesianChart
            // key={data.length}
            xKey="label" // Dynamic key for X-axis
            yKeys={["hours"]} // Y-axis always represents hours
            domain={calculateDomain(data)} // Fixed domain for hours spent
            padding={5}
            domainPadding={{ left: 50, right: 50, top: 30 }}
            axisOptions={{
              font,
              tickCount: 5,
              formatXLabel: (value) => (value !== undefined ? value : ""), // Dynamically generate X-axis labels
              lineColor: "transparent", // Hides the Y-axis line
              labelColor: isDark ? "white" : "black",
              hideYAxis: true, // Custom prop for hiding Y-axis
            }}
            chartPressState={state} // Allows tooltip to show on press
            data={data} // Dynamically generated based on filter
          >
            {({ points, chartBounds }) => {
              return (
                <>
                  <Bar
                    points={points.hours}
                    chartBounds={chartBounds}
                    animate={{ type: "spring", duration: 1000 }}
                    barGap={5} // Small gap between bars
                    roundedCorners={{
                      topLeft: 10,
                      topRight: 10,
                    }}
                  >
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(0, 400)}
                      colors={["#FF69B4", "#FFB6C150"]} // Pink gradient
                    />
                  </Bar>

                  {isActive ? (
                    <>
                      <SKText
                        font={toolTipFont}
                        color={isDark ? "white" : "black"}
                        x={textXPosition}
                        y={textYPosition}
                        text={value}
                      />
                      <Circle
                        cx={state.x.position}
                        cy={state.y.hours.position}
                        r={8}
                        color={"grey"}
                        opacity={0.8}
                      />
                    </>
                  ) : null}
                </>
              );
            }}
          </CartesianChart>
        </Box>
      </ScrollView>
    </Box>
  );
};