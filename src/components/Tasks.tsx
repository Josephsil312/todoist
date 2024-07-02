import { Pressable, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import firestore, { firebase } from '@react-native-firebase/firestore';
import RBSheet from 'react-native-raw-bottom-sheet';
import auth from '@react-native-firebase/auth';
import Plusicon from 'react-native-vector-icons/AntDesign';
import Iconn from 'react-native-vector-icons/Ionicons';
import SwipeableRow from './SwipableRow';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Check from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/FontAwesome';
import Editable from './Editable';
import { useTasks } from './TasksContextProvider';

const Tasks = () => {
    const tasksContext = useTasks();
    if (!tasksContext) {
        throw new Error('useTasks must be used within a TasksContextProvider');
    }
    const { tasks, setTasks, setDocId } = tasksContext
    const [text, setText] = useState('');
    const [selectedItem, setSelectedItem] = useState()
    const [isRBSheetOpen, setIsRBSheetOpen] = useState(false);
    const userId = auth().currentUser?.uid;
    const userCollection = firestore().collection('users').doc(userId).collection('tasks');
    const refRBSheet = useRef<RBSheet>(null);
    const refEditableTask = useRef<RBSheet>(null);

    const handleAddTask = async () => {
        if (text.trim() !== '') {
            try {
                const newTask = {
                    name: text,
                    isCompleted: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                setText('')
                await userCollection.add({
                    ...newTask
                })

            } catch (error) {
                console.error('Error adding task:', error);
            }
        }

    };

    useEffect(() => {
        const unsubscribe = userCollection
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const newTasks = snapshot.docs.map(doc => ({
                    firestoreDocId: doc.id,
                    ...doc.data(),
                }));
                setTasks(newTasks);

            });
        return () => unsubscribe();
    }, []);

    const deleteTask = async (id: any) => {
        try {
            await userCollection.doc(id).delete();
        } catch (error) {
            console.error('Error deleting task from Firestore:', error);
        }
    }

    const handleCompleteTask = async (firestoreDocId: any) => {
        try {
            const taskRef = userCollection.doc(firestoreDocId)
            console.log('taskRef', taskRef)
            await taskRef.set({ isCompleted: true }, { merge: true });
            console.log('Task completed successfully.');
        } catch (error) {
            console.error('Error updating completed task:', error);
        }
    }

    const toggleTask = async (firestoreDocId: any) => {
        try {
            const taskRef = userCollection.doc(firestoreDocId);
            await taskRef.set({ isCompleted: false }, { merge: true });
            console.log('Task toggled successfully.');
        } catch (error) {
            console.error('Error updating toggled task:', error);
        }
    }

    const sections = [
        { data: tasks.filter((task: any) => !task.isCompleted) },
        { title: 'Completed Tasks', data: tasks.filter((task: any) => task.isCompleted) },
    ];

    const openRBSheet = (item: any) => {
        setIsRBSheetOpen(true)
        if (refEditableTask?.current) {
            refEditableTask.current.open();
            setSelectedItem(item)
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <GestureHandlerRootView>
                <Pressable onPress={() => { openRBSheet(item.name); setDocId(item.firestoreDocId) }}>
                    <SwipeableRow onDelete={() => deleteTask(item.firestoreDocId)}>
                        <View style={styles.taskContainer}>
                            <View style={{ width: 'auto' }}>
                                <View style={styles.taskItemsContainer}>
                                    {item.isCompleted ? (
                                        <TouchableOpacity onPress={() => {
                                            toggleTask(item.firestoreDocId);
                                        }}>
                                            <Check name="checkcircle" size={24} color={'#001d76'} />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity onPress={() => handleCompleteTask(item.firestoreDocId)}>
                                            <Icon name="circle-thin" size={27} color="#001d76" />
                                        </TouchableOpacity>
                                    )}
                                    <Text style={{ marginLeft: 20, fontSize: 16, textDecorationLine: item.isCompleted ? "line-through" : '', color: '#001d76' }}>{item.name}</Text>
                                </View>
                            </View>
                        </View>
                    </SwipeableRow>
                </Pressable>
            </GestureHandlerRootView>
        )
    }

    return (
        <>
            <View style={{ flex: 1 }}>
                <SectionList sections={sections} keyExtractor={(item: any) => item.firestoreDocId} renderItem={renderItem} />
            </View>
            <RBSheet
                ref={refRBSheet}
                useNativeDriver={true}
                closeOnPressBack={true}

                onClose={() => { setIsRBSheetOpen(false) }}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'transparent',
                    },
                    draggableIcon: {
                        backgroundColor: '#000',
                    },
                    container: {
                        height: '57%',
                    }
                }}
                customModalProps={{
                    animationType: 'slide',
                    statusBarTranslucent: true,
                }}
                customAvoidingViewProps={{
                    enabled: false,
                }}>
                <View>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput onChangeText={(text) => setText(text)} value={text} placeholderTextColor="grey" placeholder='Add todo' style={styles.inputTodo} />
                    <Pressable onPress={handleAddTask} style={styles.addingtaskicon}>
                        {
                            text.trim() !== ''
                                ? <Iconn name="arrow-up-circle" size={37} color={'#001d76'} />
                                : <Iconn name="arrow-up-circle-outline" size={37} color="#001d76" />
                        }
                    </Pressable>
                </View>
            </RBSheet>
            <RBSheet
                ref={refEditableTask}
                useNativeDriver={true}
                closeOnPressMask={true}
                onClose={() => { setIsRBSheetOpen(false) }}
                closeOnPressBack={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'transparent',
                    },
                    draggableIcon: {
                        backgroundColor: '#000',
                    },
                    container: {
                        height: '60%',
                        borderTopRightRadius: 20
                    }
                }}
                customModalProps={{
                    animationType: 'slide',
                    statusBarTranslucent: true,
                }}
                customAvoidingViewProps={{
                    enabled: false,
                }}>
                <Editable selectedItem={selectedItem} />
            </RBSheet>
            <View
                style={styles.addicon}>
                <Pressable
                    onPress={() => {
                        if (refRBSheet?.current) {
                            refRBSheet.current.open();
                            setIsRBSheetOpen(true);
                        }
                    }}>
                    <Plusicon name="pluscircle" size={58} color="#001d76" style={{
                        shadowColor: '#444167', elevation: 6, shadowOpacity: 0.6,
                        shadowRadius: 20,
                    }} />
                </Pressable>
            </View>
        </>

    )
}

export default Tasks

const styles = StyleSheet.create({
    addicon: {
        position: 'absolute',
        bottom: 7,
        right: 7,
    },
    addingtaskicon: {
        position: 'relative',
        zIndex: 9999999
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    taskContainer: {
        width: 400,
        height: 60,
        backgroundColor: 'white',
        padding: 5,
        marginVertical: 5,
        borderRadius: 5,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    taskItemsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    inputTodo: {
        color: 'grey',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: '#001d76',
        width: '80%'
    }
})