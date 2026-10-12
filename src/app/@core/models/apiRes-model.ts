export interface ApiRes<T = any> {
  
  isSuccess:boolean,
  message:string;
  result:any
  data: T; 
}

