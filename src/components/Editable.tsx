import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, {useState } from 'react'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTasks } from './TasksContextProvider';
const Editable = (props: any) => {
    const tasksContext = useTasks();
    if (!tasksContext) {
        throw new Error('useTasks must be used within a TasksContextProvider');
    }
    const { tasks, setTasks, docId } = tasksContext
    const [editedText, setEditedText] = useState(props.selectedItem);
    const userId = auth().currentUser.uid;
    const userCollection = firestore().collection('users').doc(userId).collection('tasks');

    const handleSave = async (docId: any) => {
        const updatedData = {
            name: editedText || '',
        };
        try {
            const taskRef = userCollection.doc(docId);
            await taskRef.set(updatedData, { merge: true });
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.firestoreDocId === docId ? { ...task, ...updatedData } : task
                )
            );
        } catch (error) {
            console.log('Error updating task:', error);

        }
    };

    return (
        <View style={styles.editableTaskContainer}>
            <TextInput onChangeText={(text: any) => setEditedText(text)} value={editedText}
                placeholder={'Edit task'}
                maxLength={30}
                placeholderTextColor="grey"
                style={styles.input}
            />
            <Pressable onPress={() => handleSave(docId)} style={styles.save}><Text style={{ textAlign: 'center',color:'white' }}>Save</Text></Pressable>
        </View>
    )
}

export default Editable

const styles = StyleSheet.create({
    editableTaskContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    input: {
        color: 'grey',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: '#001d76',
        width: '80%'
    },
    save:{
        backgroundColor: '#001d76', 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        borderRadius: 5
    }
})