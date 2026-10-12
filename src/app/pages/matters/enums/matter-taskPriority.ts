export enum MatterTaskPriority{
    High=1,
    Low=2,
    Urgent=3,
    Medium=4
}
export const MatterTaskPriorityLabel:any ={
    [MatterTaskPriority.High]:'High',
    [MatterTaskPriority.Low]:'Low',
    [MatterTaskPriority.Urgent]:'Urgent',
    [MatterTaskPriority.Medium]:'Medium',
}
