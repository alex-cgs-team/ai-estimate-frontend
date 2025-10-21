// Страница ожидания прогресса выполнения расчёта (estimate).
// Берёт executionId из URL и слушает две ветки RTDB:
//   - operations: список шагов/операций процесса
//   - sharedLink: ссылка на итоговый документ/ресурс
// Ожидаемый путь: profiles/{uid}/estimates/{executionId}/...
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref as dbRef, onValue } from 'firebase/database';
import { rtdb } from './firebase';


export default function WaitingPage({ user }: { user: any }) {
  const { executionId } = useParams<{ executionId: string }>();
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [sharedLink, setSharedLink] = useState<string | null>(null);

  useEffect(() => {
    // Без пользователя или executionId подписка не имеет смысла
    console.log(executionId, user)
    if (!user || !executionId) return;
  
    const operationsRef = dbRef(rtdb, `profiles/${user.uid}/estimates/${executionId}/operations`);
    const sharedLinkRef = dbRef(rtdb, `profiles/${user.uid}/estimates/${executionId}/sharedLink`);
  
    console.log(operationsRef)
    // Слушаем операции. Ожидается, что узлы имеют поля { step, status, progress } или строковые значения.
    const unsubscribeOps = onValue(operationsRef, snapshot => {
      const steps: string[] = [];
      snapshot.forEach(snap => {
        const op = snap.val();
        // Поддерживаем два формата: объект шагов и чистые строки
        if (op && typeof op === 'object' && 'step' in op) {
          steps.push(`${op.step}: ${op.status} (${op.progress ?? 0}%)`);
        } else {
          steps.push(String(op));
        }
      });
      setProgressSteps(steps);
    });
  
    // Слушаем sharedLink
    const unsubscribeLink = onValue(sharedLinkRef, snapshot => {
      setSharedLink(snapshot.val());
    });
  
    return () => {
      unsubscribeOps();
      unsubscribeLink();
    };
  }, [user, executionId]);
  
  
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Estimate Progress</h2>
      <ul className="space-y-2">
        {progressSteps.map((step, i) => (
          <li key={i} className="bg-gray-100 p-2 rounded">{step}</li>
        ))}
      </ul>
      {sharedLink && (
        <div className="mt-4">
          <a href={sharedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Open Estimate
          </a>
        </div>
      )}
    </div>
  );
}
