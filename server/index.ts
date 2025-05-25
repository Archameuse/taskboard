import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { apps } from 'firebase-admin'
type Icons = '🧑‍💻'|'💬'|'☕'|'🏋️'|'📚'|'⏰';
type Status = 'progress'|'completed'|'wont';
type Task = {
  id: string;
  icon: Icons;
  name: string;
  description?:string;
  status?: Status;
};
type Board = {
  name: string;
  id?: string;
  description?: string;
}



const app = express()
app.use(express.json())
app.use(cors({
    origin: 'https://taskboard-eight-wheat.vercel.app/'
}))


// const PORT = Number(process.env.port)||3000
let SERVICE_ACCOUNT
if(process.env.SERVICE_ACCOUNT) {
    SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_ACCOUNT)
} else throw new Error('Something went wrong with service account')

if(!apps?.length&&SERVICE_ACCOUNT) {
    initializeApp({
        credential: cert(SERVICE_ACCOUNT),

    })
}
const db = getFirestore()
db.settings({ignoreUndefinedProperties: true})
const collection = db.collection('boards')
const taskColId = 'tasks'

app.listen(3000, () => {
    console.log(`listening on ${3000}`)
})

app.get('/api/board-exist', async (req,res) => {
    try {
        const {id} = req.query
        if(typeof id !== 'string') throw new Error('No board id provided')
        if((await collection.doc(id).get()).exists||(await collection.doc(id).listCollections()).length) res.status(200).send('Exist')
        else res.status(404).send('Not exist')
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

app.get('/api/board', async (req,res) => {
    console.log('IT WORKS KINDA')
    res.status(200).send('Happened heree')
    return
    try {
        const {id} = req.query
        if(typeof id !== 'string') throw new Error('No board id provided')
        const board = await collection.doc(id).get()
        if(board.exists||(await collection.doc(id).listCollections()).length) {
            const tasks = ((await collection.doc(id).collection(taskColId).get()).docs.map(doc => {
                const task = doc.data()
                return {
                    id: doc.id,
                    icon: task.icon||'⏰',
                    name: task.name||'Default name',
                    description: task.description,
                    status: task.status
                } as Task
            }))
            res.status(200).send({
                board: {
                    id: board.id,
                    name: board.data()?.name,
                    description: board.data()?.description
                } as Board,
                tasks
            })
        } else {
            res.status(404).send('No board with such id exist')
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

app.post('/api/board', async (req,res) => {
    try {   
        if(!req.body) throw new Error('No body provided')
        const { board, tasks }:{board:Board,tasks:Task[]} = req.body
        if(!board.id) throw new Error('No ID provided')
        if(!tasks?.length) throw new Error('No tasks data provided')
        const boardRef = collection.doc(board.id)
        await boardRef.set({
            name: board.name,
            description: board.description
        }).then(async () => {
            for(const task of tasks) {
                if(!task.id||!task.name||!task.icon) throw new Error('Incorrect task structure provided')
                await boardRef.collection(taskColId).doc(task.id).set({
                    icon: task.icon,
                    name: task.name,
                    description: task.description,
                    status: task.status
                })
            }
        })
        res.status(200).send(board)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

app.patch('/api/board', async (req,res) => {
    try {
        if(!req.body) throw new Error('No body provided')
        const { board }:{board:Board} = req.body
        if(!board.id) throw new Error('No ID provided')
        await collection.doc(board.id).set({
            name: board.name,
            description: board.description
        })
        res.status(200).send(board.id)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.delete('/api/board', async (req,res) => {
    try {
        const {id} = req.query
        if(typeof id !== 'string') throw new Error('Wrong query provided')
        await collection.doc(id).delete()
        res.status(200).send('Success')
    } catch (error) {
        res.status(500).send(error)
    }
})

app.post('/api/task', async (req,res) => {
    try {
        if(!req.body) throw new Error('No body provided')
        const { id, task }:{id:string,task:Task} = req.body
        if(!id) throw new Error('No ID provided')
        if(!task) throw new Error('No task data provided')
        if(!task.id||!task.icon||!task.name) throw new Error('Wrong task data')
        if(!(await collection.doc(id).get()).exists&&!(await collection.doc(id).listCollections()).length) throw new Error('Wrong ID provided')
        await collection.doc(id).collection(taskColId).doc(task.id).set({
            icon: task.icon,
            name: task.name,
            description: task.description,
            status: task.status
        })
        res.status(200).send(task.id)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

app.delete('/api/task', async (req,res) => {
    try {
        const {id,taskId} = req.query
        if(typeof id !== 'string' || typeof taskId !== 'string') throw new Error('Wrong query provided')
        const docRef = collection.doc(id).collection(taskColId).doc(taskId)
        if((await docRef.get()).exists) {
            await collection.doc(id).collection(taskColId).doc(taskId).delete()
            res.status(200).send('Success')
        } else res.status(404).send('Such task was not found')
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})
app.patch('/api/task', async (req,res) => {
    try {
        if(!req.body) throw new Error('No body provided')
        const { id, task }:{id:string,task:Task} = req.body
        if(!id) throw new Error('No board ID provided')
        if(!task) throw new Error('No task data provided')
        if(!task.id) throw new Error('No task ID provided')
        if(!(await collection.doc(id).collection(taskColId).doc(task.id).get()).exists) throw new Error('Cant find this task (most likely wrong board ID)')
        await collection.doc(id).collection(taskColId).doc(task.id).set({
            icon: task.icon,
            name: task.name,
            description: task.description||FieldValue.delete(),
            status: task.status||FieldValue.delete()
        }, {merge: true})
        res.status(200).send(task.id)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})


app.use((req,res) => {
    // errorhandler
    res.status(404).send('Wrong path')
})

export default app