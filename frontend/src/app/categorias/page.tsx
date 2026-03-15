'use client';

import { useMemo, useRef, useState } from 'react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { DashboardState } from '@/components/dashboard/dashboard-state';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/components/auth/auth-provider';
import {
  CATEGORIES_QUERY,
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION
} from '@/lib/graphql/categories';

type CategoryRecord = {
  id: string;
  userId: string | null;
  name: string;
  kind: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  icon: string | null;
  isBuiltin: boolean;
};

type CategoriesQueryData = {
  categories: CategoryRecord[];
};

const kindOptions = [
  { value: 'EXPENSE', label: 'Gasto' },
  { value: 'INCOME', label: 'Ingreso' },
  { value: 'TRANSFER', label: 'Transferencia' }
] as const;

function getCategoryError(error: unknown) {
  const message =
    error instanceof ApolloError
      ? error.graphQLErrors[0]?.message ?? error.message
      : error instanceof Error
        ? error.message
        : 'No fue posible completar la accion.';

  if (
    message === 'No se puede eliminar una categoria con movimientos o presupuestos asociados.'
  ) {
    return 'No puedes eliminar esta categoria porque ya fue usada en transacciones o presupuestos.';
  }

  if (error instanceof ApolloError) {
    return message;
  }

  return message;
}

function getCategoryKindLabel(kind: CategoryRecord['kind']) {
  if (kind === 'INCOME') {
    return 'Ingreso';
  }

  if (kind === 'TRANSFER') {
    return 'Transferencia';
  }

  return 'Gasto';
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<(typeof kindOptions)[number]['value']>('EXPENSE');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, error } = useQuery<CategoriesQueryData>(CATEGORIES_QUERY);
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY_MUTATION, {
    refetchQueries: [{ query: CATEGORIES_QUERY }]
  });
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY_MUTATION, {
    refetchQueries: [{ query: CATEGORIES_QUERY }]
  });
  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_CATEGORY_MUTATION, {
    refetchQueries: [{ query: CATEGORIES_QUERY }]
  });

  const categories = data?.categories ?? [];
  const builtinCategories = useMemo(
    () => categories.filter((category) => category.isBuiltin),
    [categories]
  );
  const customCategories = useMemo(
    () => categories.filter((category) => !category.isBuiltin),
    [categories]
  );
  const visibleCategories =
    activeTab === 'builtin' ? builtinCategories : customCategories;

  function resetForm() {
    setFormMode('create');
    setEditingCategoryId(null);
    setName('');
    setKind('EXPENSE');
  }

  function startCreateFlow() {
    resetForm();
    setIsFormVisible(true);
    setFeedback(null);
    setErrorMessage(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit() {
    setFeedback(null);
    setErrorMessage(null);

    try {
      if (formMode === 'create') {
        await createCategory({
          variables: {
            input: {
              name,
              kind
            }
          }
        });
        setFeedback('Categoria creada correctamente.');
      } else if (editingCategoryId) {
        await updateCategory({
          variables: {
            input: {
              id: editingCategoryId,
              name,
              kind
            }
          }
        });
        setFeedback('Categoria actualizada correctamente.');
      }

      resetForm();
      setIsFormVisible(false);
    } catch (submitError) {
      setErrorMessage(getCategoryError(submitError));
    }
  }

  function handleEdit(category: CategoryRecord) {
    if (category.isBuiltin) {
      setErrorMessage('Las categorias base no se editan desde esta pantalla.');
      return;
    }

    setIsFormVisible(true);
    setFormMode('edit');
    setEditingCategoryId(category.id);
    setName(category.name);
    setKind(category.kind);
    setFeedback(null);
    setErrorMessage(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleDelete(category: CategoryRecord) {
    const confirmed = window.confirm(
      'La categoria se eliminara si no tiene movimientos ni presupuestos asociados. Deseas continuar?'
    );

    if (!confirmed) {
      return;
    }

    setFeedback(null);
    setErrorMessage(null);

    try {
      await deleteCategory({
        variables: {
          categoryId: category.id
        }
      });
      setFeedback('Categoria eliminada correctamente.');
      if (editingCategoryId === category.id) {
        resetForm();
        setIsFormVisible(false);
      }
    } catch (deleteError) {
      setErrorMessage(getCategoryError(deleteError));
    }
  }

  if (loading) {
    return (
      <DashboardShell
        currentPath="/categorias"
        title="Categorias"
        subtitle="Cargando tus categorias..."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Cargando categorias"
          message="Estamos consultando categorias base y personalizadas."
        />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell
        currentPath="/categorias"
        title="Categorias"
        subtitle="No fue posible cargar las categorias."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Error al cargar categorias"
          message="Revisa la conexion con el backend e intenta nuevamente."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      currentPath="/categorias"
      title="Categorias"
      subtitle="Organiza y consulta tus categorias personales y globales."
      userLabel={user?.name}
      userSubLabel={user?.email}
      actions={
        <button className="primary-button compact" onClick={startCreateFlow}>
          Nueva categoria
        </button>
      }
    >
      <section className="tabs-row">
        <button
          type="button"
          className={`tab ${activeTab === 'builtin' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('builtin')}
        >
          Globales
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'custom' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Personalizadas
        </button>
      </section>

      {isFormVisible ? (
        <section className="account-form-card" ref={formRef}>
          <div className="section-header">
            <h2>{formMode === 'create' ? 'Crear categoria' : 'Editar categoria'}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                resetForm();
                setIsFormVisible(false);
                setFeedback(null);
                setErrorMessage(null);
              }}
            >
              {formMode === 'edit' ? 'Cancelar edicion' : 'Cerrar formulario'}
            </button>
          </div>
          <div className="form-grid">
            <label>
              <span>Nombre</span>
              <input
                className="field-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Transporte"
              />
            </label>
            <label>
              <span>Tipo</span>
              <select
                className="field-control"
                value={kind}
                onChange={(event) => setKind(event.target.value as never)}
              >
                {kindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {feedback ? <p className="form-success">{feedback}</p> : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <div className="page-actions">
            <button
              type="button"
              className="primary-button compact"
              disabled={creating || updating || !name.trim()}
              onClick={handleSubmit}
            >
              {creating || updating
                ? 'Guardando...'
                : formMode === 'create'
                  ? 'Crear categoria'
                  : 'Guardar cambios'}
            </button>
          </div>
        </section>
      ) : (
        <section className="dashboard-state">
          <h2>Gestion de categorias</h2>
          <p>
            Usa <strong>Nueva categoria</strong> para crear una personalizada o
            <strong> Editar</strong> para actualizar una existente.
          </p>
        </section>
      )}

      <section className="table-card">
        <div className="section-header">
          <h2>Listado de categorias</h2>
          <div className="search-chip">{visibleCategories.length} visibles</div>
        </div>

        <div className="simple-table">
          <div className="table-head">
            <span>Categoria</span>
            <span>Tipo</span>
            <span>Origen</span>
            <span>Acciones</span>
          </div>
          {visibleCategories.length === 0 ? (
            <div className="table-row">
              <strong>No hay categorias en esta vista.</strong>
              <span />
              <span />
              <span />
            </div>
          ) : (
            visibleCategories.map((category) => (
              <div key={category.id} className="table-row">
                <strong>{category.name}</strong>
                <span>{getCategoryKindLabel(category.kind)}</span>
                <span>{category.isBuiltin ? 'Base del sistema' : 'Personal'}</span>
                <span className="action-links">
                  {!category.isBuiltin ? (
                    <>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => handleEdit(category)}
                      >
                        Editar
                      </button>
                      <span className="action-separator">|</span>
                      <button
                        type="button"
                        className="text-button text-button-danger"
                        disabled={deleting}
                        onClick={() => void handleDelete(category)}
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <span className="muted-note">Solo lectura</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
