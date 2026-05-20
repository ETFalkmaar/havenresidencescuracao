'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { addRule, deleteRule, updateRule } from './actions';

type Rule = { id: string; rule: string };

const inputClass =
  'mt-1 block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-sage-600 focus:outline-none focus:ring-1 focus:ring-sage-600';

function RuleRow({
  rule,
  propertyId,
  onDeleted,
}: {
  rule: Rule;
  propertyId: string;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSave(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await updateRule(propertyId, rule.id, formData);
      if ('error' in r) setError(r.error);
      else setEditing(false);
    });
  }

  function onDelete() {
    if (!confirm('Regel verwijderen?')) return;
    startTransition(async () => {
      const r = await deleteRule(propertyId, rule.id);
      if ('error' in r) setError(r.error);
      else onDeleted();
    });
  }

  if (editing) {
    return (
      <Card className="p-4">
        <form action={onSave} className="space-y-3">
          <input
            name="rule"
            defaultValue={rule.rule}
            required
            className={inputClass}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Opslaan…' : 'Opslaan'}
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-forest-dark/70 hover:text-forest-dark"
            >
              Annuleren
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-relaxed text-forest-dark">{rule.rule}</p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-sage-700 hover:text-sage-800"
          >
            Bewerken
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="text-red-700 hover:text-red-800"
            aria-label="Verwijderen"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </Card>
  );
}

export function RulesEditor({
  initial,
  propertyId,
}: {
  initial: Rule[];
  propertyId: string;
}) {
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await addRule(propertyId, formData);
      if ('error' in r) {
        setError(r.error);
      } else {
        setItems((prev) => [
          ...prev,
          { id: crypto.randomUUID(), rule: String(formData.get('rule') ?? '') },
        ]);
        setAdding(false);
      }
    });
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <RuleRow
          key={r.id}
          rule={r}
          propertyId={propertyId}
          onDeleted={() =>
            setItems((prev) => prev.filter((p) => p.id !== r.id))
          }
        />
      ))}

      {adding ? (
        <Card className="p-4">
          <form action={onAdd} className="space-y-3">
            <input
              name="rule"
              placeholder="Bv. 'Roken alleen buiten toegestaan'"
              required
              className={inputClass}
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? 'Toevoegen…' : 'Toevoegen'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setError(null);
                }}
                className="text-sm text-forest-dark/70 hover:text-forest-dark"
              >
                Annuleren
              </button>
            </div>
          </form>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-sage-600/50 px-4 py-2 text-sm text-sage-700 transition-colors hover:border-sage-600 hover:bg-sage-50"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Regel toevoegen
        </button>
      )}
    </div>
  );
}
