
interface AddButton{
    label:string;
    command:()=>void

}
export interface EmptyConfig{
    title?:string;
    messageTitle?:string;
    description?:string;
    addButton?:AddButton;
    addPermission:string;
}
