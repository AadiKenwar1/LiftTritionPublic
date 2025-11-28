export function insightText(mode, data, selectedLift, selectedMacro){
    let insight = "";
    let deltaPercent = 0;
    let overallDeltaPercent = 0;
    let liftsOrDays = 0;
    if(data.length > 0){
        //Calculate the delta percent between the first and last lift
        if (data.length >= 7){
            deltaPercent = ((data[6].value - data[0].value)/data[0].value)*100;
            liftsOrDays = 7
        }
        else{
            deltaPercent = ((data[data.length - 1].value - data[0].value)/data[0].value)*100;
            liftsOrDays = data.length
        }

        //Last 1-7 day insights
        if (deltaPercent > 5){
            insight = mode === true ? "Your " + selectedLift + " has increased by " + deltaPercent.toFixed(1) + "% in the last " + liftsOrDays + " lifts." : "Your " + selectedMacro + " intake has overall increased by " + deltaPercent.toFixed(1) + "% in the last " + liftsOrDays + " days."
        }
        else if (deltaPercent < -5){
            insight = mode === true ? "Your " + selectedLift + " has decreased by " + Math.abs(deltaPercent).toFixed(1) + "% in the last " + liftsOrDays + " lifts." : "Your " + selectedMacro + " intake has overall decreased by " + Math.abs(deltaPercent).toFixed(1) + "% in the last " + liftsOrDays + " days."
        }
        else{
            insight = mode === true ? "Your " + selectedLift + " has stayed relatively consistent in the last " + liftsOrDays + " lifts." : "Your " + selectedMacro + " intake has stayed overall consistent in the last " + liftsOrDays + " days."
        }

        //Overall insights
        if(data.length > 7){
            overallDeltaPercent = ((data[data.length-1].value - data[0].value)/data[0].value)*100;
            if(overallDeltaPercent > 5){
                insight += "\n\nYour all time " + selectedMacro + " intake has overall increased by " + overallDeltaPercent.toFixed(1)  + "%"
            }
            else if(overallDeltaPercent < -5){
                insight += "\n\nYour all time " + selectedMacro + " intake has overall decreased by " + Math.abs(overallDeltaPercent).toFixed(1) + "%"
            }
            else{ 
                insight += "\n\nYour all time " + selectedMacro + " intake has stayed overall consistent in the last "
            }
        }

        if (data.length === 1){
            deltaPercent = 0
            insight = "Great start! Keep logging to recieve more detailed insights"
        }
    }
    return insight;
}

export function generateGraphInfoDesc(mode, selectedData){
    let graphInfoDesc = "";
    if (selectedData === 10) {
        graphInfoDesc =
          "This graph displays your " + (mode === true? "estimated one rep max for your last 10 lifting sessions.\n\nFor each day you perform the selected exercise, we take your strongest set and use it to calculate your one rep max." : "selected macronutrient intake for the last 10 days.") + "\n\nClick points for details.";
      } else if (selectedData === 20) {
        graphInfoDesc =
          "This graph displays your " + (mode === true? "estimated 1 rep max for your last 20 lifting sessions.\n\nFor each day you perform the selected exercise, we take your strongest set and use it to calculate your one rep max." : "selected macronutrient intake for the last 20 days.") + "\n\nData is downsampled for every two lifting sessions." + "\n\nClick points for details.";
      } else {
        graphInfoDesc =
          "This graph displays your " + (mode === true? "estimated 1 rep max for your last 30 lifting sessions.\n\nFor each day you perform the selected exercise, we take your strongest set and use it to calculate your one rep max." : "selected macronutrient intake for the last 30 days.") + "\n\nData is downsampled for every three lifting sessions." + "\n\nClick points for details.";
      }
    return graphInfoDesc;
}

export function getFocusedText(mode, selectedData, focusedPoint, selectedMacro){
    let focusedText = "";
    if (!focusedPoint){
        focusedText = "No data point selected";
    }
    else if (selectedData === 10) {
        focusedText =
          "On " + focusedPoint.label + " " + (mode === true? "you had an estimated 1 rep max of " + focusedPoint.value + "." : "your " + selectedMacro + " intake was " + focusedPoint.value + ".");
    } 
    else {
        focusedText =
          "Between " + focusedPoint.label + " " + (mode === true? "you had an average estimated 1 rep max of " + focusedPoint.value + "." : "your average " + selectedMacro + " intake was " + focusedPoint.value + ".");
    }
    return focusedText;
}