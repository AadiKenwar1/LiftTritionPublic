import { formatDateForDisplay } from "../../../utils/date";

export function getFocusedText(mode, selectedData, focusedPoint, selectedMetric, unit) {
    let focusedText = "";
    if(!focusedPoint){
        focusedText = "No data point selected";
    }
    else if (selectedData === 10) {
        if (mode === true) {
            focusedText =`\nOn ${formatDateForDisplay(focusedPoint.label)} your ${selectedMetric.toLowerCase()} was ${focusedPoint.value}.`;
        } else {
            if (selectedMetric === "Bodyweight") {
                focusedText = `\nOn ${formatDateForDisplay(focusedPoint.label)} your weight was ${focusedPoint.value} ${unit ? 'lbs' : 'kg'}.`;
            } else {
                focusedText = `\nOn ${formatDateForDisplay(focusedPoint.label)} your calories were ${focusedPoint.value} kcal.`;
            }
        }
    }
    else {
        if (mode === true) {
            focusedText = "\nBetween " + focusedPoint.label + " your average " + selectedMetric.toLowerCase() + " was " + focusedPoint.value + ".";
        } else {
            if (selectedMetric === "Bodyweight") {
                focusedText = "\nBetween " + focusedPoint.label + " your average weight was " + focusedPoint.value + " " + (unit ? 'lbs' : 'kg') + ".";
            } else {
                focusedText = "\nBetween " + focusedPoint.label + " your average calories were " + focusedPoint.value + " kcal.";
            }
        }
    }
    return focusedText;
}

export function generateGraphInfoDesc(mode, selectedData, selectedMetric){
    let graphInfoDesc = "";
    if (mode === true) {
        // Lift mode descriptions
        if(selectedMetric === "Volume"){ 
            if (selectedData === 10) {
            graphInfoDesc =
                `This graph displays your total volume for each day in the last 10 lifting sessions.\n\nVolume is the total amount of weight you lifted in a day (your sets × reps × weight, added up across all your exercises).\n\nClick points for details.`;
            } else if (selectedData === 20) {
            graphInfoDesc =
                `This graph displays your total volume for each day in the last 20 lifting sessions.\n\nVolume is the total amount of weight you lifted in a day (your sets × reps × weight, added up across all your exercises).\n\nData is downsampled for every two days.\n\nClick points for details.`;
            } else {
            graphInfoDesc =
                `This graph displays your total volume for each day in the last 30 lifting sessions.\n\nVolume is the total amount of weight you lifted in a day (your sets × reps × weight, added up across all your exercises).\n\nData is downsampled for every three days.\n\nClick points for details.`;
            }
        }
        else{
            if (selectedData === 10) {
            graphInfoDesc =
                `This graph displays your total sets for each day in the last 10 lifting sessions.`;
            } else if (selectedData === 20) {
            graphInfoDesc =
                `This graph displays your total sets for each day in the last 20 lifting sessions.\n\nData is downsampled for every two days.\n\nClick points for details.`;
            } else {
            graphInfoDesc =
                `This graph displays your total sets for each day in the last 30 lifting sessions.\n\nData is downsampled for every three days.\n\nClick points for details.`;
            }
        }
    } else {
        // Macro mode descriptions
        if (selectedMetric === "Bodyweight") {
            if (selectedData === 10) {
            graphInfoDesc =
                `This graph displays your bodyweight for the last 10 days.\n\nIf you forget to log a day, the graph automatically fills that day with the previous day's bodyweight.\n\nClick points for details.`;
            } else if (selectedData === 20) {
            graphInfoDesc =
                `This graph displays your bodyweight for the last 20 days.\n\nIf you forget to log a day, the graph automatically fills that day with the previous day's bodyweight.\n\nData is downsampled for every two entries.\n\nClick points for details.`;
            } else {
            graphInfoDesc =
                `This graph displays your bodyweight for the last 30 days.\n\nIf you forget to log a day, the graph automatically fills that day with the previous day's bodyweight.\n\nData is downsampled for every three entries.\n\nClick points for details.`;
            }
        } else {
            // Calories metric
            if (selectedData === 10) {
            graphInfoDesc =
                `This graph displays your daily calorie intake for the last 10 days.\n\nClick points for details.`;
            } else if (selectedData === 20) {
            graphInfoDesc =
                `This graph displays your daily calorie intake for the last 20 days.\n\nData is downsampled for every two days.\n\nClick points for details.`;
            } else {
            graphInfoDesc =
                `This graph displays your daily calorie intake for the last 30 days.\n\nData is downsampled for every three days.\n\nClick points for details.`;
            }
        }
    }
    return graphInfoDesc;
}

export function generateInsightText(mode, data, selectedMetric){
    let insight = "";
    let deltaPercent = 0;
    let overallDeltaPercent = 0;
    let liftsOrDays = 0;
    
    if(data.length > 0){
        // Calculate the delta percent between the first and last lift
        if (data.length > 7){
            const firstValue = data[0].value;
            const seventhValue = data[6].value;
            const lastValue = data[data.length - 1].value;
            
            // Check for zero values to avoid division by zero
            if (firstValue === 0) {
                if (seventhValue > 0) {
                    deltaPercent = 100; // Infinite increase from 0
                } else {
                    deltaPercent = 0; // Both are 0, no change
                }
            } else {
                deltaPercent = ((seventhValue - firstValue) / firstValue) * 100;
            }
            
            if (firstValue === 0) {
                if (lastValue > 0) {
                    overallDeltaPercent = 100; // Infinite increase from 0
                } else {
                    overallDeltaPercent = 0; // Both are 0, no change
                }
            } else {
                overallDeltaPercent = ((lastValue - firstValue) / firstValue) * 100;
            }
            
            liftsOrDays = 7;
        } else {
            const firstValue = data[0].value;
            const lastValue = data[data.length - 1].value;
            
            // Check for zero values to avoid division by zero
            if (firstValue === 0) {
                if (lastValue > 0) {
                    deltaPercent = 100; // Infinite increase from 0
                } else {
                    deltaPercent = 0; // Both are 0, no change
                }
            } else {
                deltaPercent = ((lastValue - firstValue) / firstValue) * 100;
            }
            
            liftsOrDays = data.length;
        }

        // Last 1-7 day insights
        if(mode === true){
            if(deltaPercent > 5){
                insight = selectedMetric === "Volume" ? "Your total volume has increased by " + deltaPercent.toFixed(1) + "% in the last " + liftsOrDays + " lifts." : "Your total sets has increased by " + deltaPercent.toFixed(1) + "% in the last " + liftsOrDays + " lifts."
            }
            else if (deltaPercent < -5){
                insight = selectedMetric === "Volume" ? "Your total volume has decreased by " + Math.abs(deltaPercent).toFixed(1) + "% in the last " + liftsOrDays + " lifts." : "Your total sets has decreased by " + Math.abs(deltaPercent).toFixed(1) + "% in the last " + liftsOrDays + " lifts."
            }
            else{
                insight = selectedMetric === "Volume" ? "Your total volume has stayed relatively consistent in the last " + liftsOrDays + " lifts." : "Your total sets has stayed relatively consistent in the last " + liftsOrDays + " lifts."
            }
        }
        else{
            if(deltaPercent > 5){
                insight = selectedMetric === "Bodyweight" ? "Your bodyweight has increased by " + deltaPercent.toFixed(1) + "% in the last " + liftsOrDays + " days." : "Your daily calorie intake has increased by " + deltaPercent.toFixed(1) + "% in the last " + liftsOrDays + " days."
            }
            else if (deltaPercent < -5){
                insight = selectedMetric === "Bodyweight" ? "Your bodyweight has decreased by " + Math.abs(deltaPercent).toFixed(1) + "% in the last " + liftsOrDays + " days." : "Your daily calorie intake has decreased by " + Math.abs(deltaPercent).toFixed(1) + "% in the last " + liftsOrDays + " days."
            }
            else{
                insight = selectedMetric === "Bodyweight" ? "Your bodyweight has stayed relatively consistent in the last " + liftsOrDays + " days." : "Your daily calorie intake has stayed relatively consistent in the last " + liftsOrDays + " days."
            }
        }
   
        
        if (data.length === 1){
            deltaPercent = 0
            insight = "Great start! Keep logging to receive more detailed insights"
        }
    }
    return insight;
}