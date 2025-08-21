/**
 *
 * @returns Object with attributes
 * label: date
 * value: estimated one rep max for the day based on all logs of date
 *
 */
export function formatForChartRoot(logData) {
    const groupByDate = {};

    for (const log of logData) {
        const estimated1RM = log.weight * (1 + log.reps / 30);
        if (!groupByDate[log.date]) {
            groupByDate[log.date] = [];
        }
        groupByDate[log.date].push(estimated1RM);
    }

    const chartDate= Object.entries(groupByDate).map(([date, values]) => {
        const [year, month, day] = date.split('-');
        return {
            label: `${month}/${day}`,
            value: Math.floor(
                Math.max(...values)
            ),
        };
    });
    return chartDate.reverse();
}
