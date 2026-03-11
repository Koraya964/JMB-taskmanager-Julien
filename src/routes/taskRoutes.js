import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { getTasks, getTask, createTask, updateTask, toggleTask, deleteTask } from '../controllers/taskController.js';

const router = Router();
//Middleware Auth pour s'assurer que le client est bien connecté 
router.use(authMiddleware);
//Creation des routes avec ses controller associés 
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);

export default router;
