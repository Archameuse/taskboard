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
