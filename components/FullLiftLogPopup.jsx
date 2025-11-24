import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

export default function FullLiftLog(props) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visible}
      onRequestClose={props.onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{`All Time Logs of ` + props.selectedExercise}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
                <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
        </View>
          
          <View style={styles.content}>
            <FlatList
                data={props.data}
                keyExtractor={(item, index) => item.date + index}
                
                renderItem={({ item }) => (
                    <View style = {styles.logContainer}>
                        <View style={{ paddingVertical: 0 }}>
                            {/* Date Header */}
                            <View style={styles.lineWithText}>
                                <View style={styles.line} />
                                <Text style={styles.lineText}>{item.date}</Text>
                                <View style={styles.line} />
                            </View>

                            {/* Logs under the date */}
                            {item.logs.map((log, idx) => (
                            <View key={idx} style={styles.logItem}>
                                <Text style={styles.logText}>{log.weight} lbs x {log.reps} reps @ {log.workout}</Text>
                            </View>
                            ))}
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: '#11394F',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  header: {
    position: 'relative', // ensure positioning context for absolute child
    marginBottom: 16,
    paddingRight: 40, // add padding so the title text doesn't collide with ✕
    },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8, // tap-friendly touch area
    zIndex: 10,
  },
  close: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  lineWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    borderColor:'white'
  },
  lineText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 500,
    color: 'white',
  },
  logContainer:{
    flex:1,
    paddingHorizontal:20
  },
  logItem: {
    backgroundColor: '#172337',
    height: 60,
    borderRadius: 10,
    borderColor: '#00CFFF',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 5,
  },
  logText: {
    fontSize: 16,
    color: 'white'
  },
})
