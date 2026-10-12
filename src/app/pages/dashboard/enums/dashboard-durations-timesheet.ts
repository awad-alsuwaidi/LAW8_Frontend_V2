export enum DashboardDurationTimeSheet {
    // All = 4,
    today = 1,
    tomorrow = 2,
    thisWeek = 3,
    thisMonth=4
}

export const DashboardDurationTimeSheetOptions = [
    // { [DashboardDuration.All]: 'All' },
    { [DashboardDurationTimeSheet.today]: 'Today' },
    { [DashboardDurationTimeSheet.tomorrow]: 'Tomorrow' },
    { [DashboardDurationTimeSheet.thisWeek]: 'This Week' },
    { [DashboardDurationTimeSheet.thisMonth]: 'This Month' },
]
