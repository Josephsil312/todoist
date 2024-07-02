
import React, { PropsWithChildren, useCallback, createContext, useContext, useState } from 'react'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
const TasksContext = createContext<TasksContextType | undefined>(undefined);

export type Task = {
    id: string;
    name: string;
    isCompleted: boolean;
    firestoreDocId:string
}

type TasksContextType = {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    email:any;
    setEmail:any;
    password:any;
    setPassword:any;
    docId:any;
    setDocId:any;
    isLoggedIn:any;
    setIsLoggedIn:any;
   
};

const TasksContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoggedIn,setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [docId,setDocId] = useState('')
  const [password, setPassword] = useState('');
  
    return (
        <TasksContext.Provider value={{tasks, setTasks,isLoggedIn,setIsLoggedIn,docId,setDocId,password, setPassword,email, setEmail}}>
            {children}
        </TasksContext.Provider>
    )
}

export default TasksContextProvider;
export const useTasks = () => useContext(TasksContext)