import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, ShieldCheck, Lock, Plus, Pencil, UploadCloud } from 'lucide-react'
import { api, type BibleVersion, type BibleVersionMetadata, type BibleVersionUpdateInput, type BibleVerse } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Input, Textarea } from '@/components/ui/input'
import { DetailPanel, DetailField } from '@/components/ui/detail-panel'

function formatBytes(bytes: number) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

interface FormState {
  name: string
  shortname: string
  year: string
  lang: string
  lang_short: string
  publisher: string
  owner: string
  url: string
  module: string
  module_version: string
  copyright_statement: string
  citation_limit: string
  description: string
  official: boolean
  restrict: boolean
  italics: boolean
  strongs: boolean
  red_letter: boolean
  paragraph: boolean
  research: boolean
  copyright: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  shortname: '',
  year: '',
  lang: '',
  lang_short: '',
  publisher: '',
  owner: '',
  url: '',
  module: '',
  module_version: '',
  copyright_statement: '',
  citation_limit: '0',
  description: '',
  official: false,
  restrict: false,
  italics: false,
  strongs: false,
  red_letter: false,
  paragraph: false,
  research: false,
  copyright: false,
}

function metadataToForm(metadata?: BibleVersionMetadata): FormState {
  if (!metadata) return EMPTY_FORM
  return {
    name: metadata.name ?? '',
    shortname: metadata.shortname ?? '',
    year: metadata.year ?? '',
    lang: metadata.lang ?? '',
    lang_short: metadata.lang_short ?? '',
    publisher: metadata.publisher ?? '',
    owner: metadata.owner ?? '',
    url: metadata.url ?? '',
    module: metadata.module ?? '',
    module_version: metadata.module_version ?? '',
    copyright_statement: metadata.copyright_statement ?? '',
    citation_limit: String(metadata.citation_limit ?? 0),
    description: metadata.description ?? '',
    official: !!metadata.official,
    restrict: !!metadata.restrict,
    italics: !!metadata.italics,
    strongs: !!metadata.strongs,
    red_letter: !!metadata.red_letter,
    paragraph: !!metadata.paragraph,
    research: !!metadata.research,
    copyright: !!metadata.copyright,
  }
}

function formToPayload(form: FormState): Partial<BibleVersionMetadata> & Pick<BibleVersionMetadata, 'name' | 'shortname'> {
  return {
    name: form.name,
    shortname: form.shortname,
    year: form.year,
    lang: form.lang,
    lang_short: form.lang_short,
    publisher: form.publisher || null,
    owner: form.owner || null,
    url: form.url || null,
    module: form.module,
    module_version: form.module_version,
    copyright_statement: form.copyright_statement,
    citation_limit: Number(form.citation_limit) || 0,
    description: form.description,
    official: form.official ? 1 : 0,
    restrict: form.restrict ? 1 : 0,
    italics: form.italics ? 1 : 0,
    strongs: form.strongs ? 1 : 0,
    red_letter: form.red_letter ? 1 : 0,
    paragraph: form.paragraph ? 1 : 0,
    research: form.research ? 1 : 0,
    copyright: form.copyright ? 1 : 0,
  }
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">{label}</p>
      {children}
    </div>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border bg-bg accent-primary"
      />
      {label}
    </label>
  )
}

function FileUploadField({
  fileName,
  verseCount,
  error,
  currentVerseCount,
  onFile,
}: {
  fileName: string | null
  verseCount: number | null
  error: string | null
  currentVerseCount: number | null
  onFile: (file: File) => void
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
        <UploadCloud className="h-3.5 w-3.5" /> Fichier JSON de la bible (métadonnées + versets)
      </p>
      <input
        type="file"
        accept="application/json,.json"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
        className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-surface-hover file:px-3 file:py-2 file:text-sm file:text-gray-200 hover:file:bg-border"
      />
      {fileName && !error && (
        <p className="mt-2 text-xs text-emerald-400">
          {fileName} — {verseCount ?? 0} versets détectés
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {!fileName && !error && currentVerseCount !== null && (
        <p className="mt-2 text-xs text-gray-500">
          {currentVerseCount} versets actuels — laissez vide pour les conserver.
        </p>
      )}
    </div>
  )
}

function BibleVersionFormFields({ form, onChange }: { form: FormState; onChange: (form: FormState) => void }) {
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => onChange({ ...form, [key]: value })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nom">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </FormField>
        <FormField label="Abréviation">
          <Input value={form.shortname} onChange={(e) => set('shortname', e.target.value)} />
        </FormField>
        <FormField label="Année">
          <Input value={form.year} onChange={(e) => set('year', e.target.value)} />
        </FormField>
        <FormField label="Langue">
          <Input value={form.lang} onChange={(e) => set('lang', e.target.value)} />
        </FormField>
        <FormField label="Code langue">
          <Input value={form.lang_short} onChange={(e) => set('lang_short', e.target.value)} />
        </FormField>
        <FormField label="Éditeur">
          <Input value={form.publisher} onChange={(e) => set('publisher', e.target.value)} />
        </FormField>
        <FormField label="Propriétaire">
          <Input value={form.owner} onChange={(e) => set('owner', e.target.value)} />
        </FormField>
        <FormField label="URL">
          <Input value={form.url} onChange={(e) => set('url', e.target.value)} />
        </FormField>
        <FormField label="Module">
          <Input value={form.module} onChange={(e) => set('module', e.target.value)} />
        </FormField>
        <FormField label="Version du module">
          <Input value={form.module_version} onChange={(e) => set('module_version', e.target.value)} />
        </FormField>
        <FormField label="Limite de citation">
          <Input type="number" value={form.citation_limit} onChange={(e) => set('citation_limit', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Mentions de copyright">
        <Input value={form.copyright_statement} onChange={(e) => set('copyright_statement', e.target.value)} />
      </FormField>
      <FormField label="Description">
        <Textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </FormField>
      <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-4">
        <CheckboxField label="Officielle" checked={form.official} onChange={(v) => set('official', v)} />
        <CheckboxField label="Restreinte" checked={form.restrict} onChange={(v) => set('restrict', v)} />
        <CheckboxField label="Italique" checked={form.italics} onChange={(v) => set('italics', v)} />
        <CheckboxField label="Strong's" checked={form.strongs} onChange={(v) => set('strongs', v)} />
        <CheckboxField label="Paroles du Christ en rouge" checked={form.red_letter} onChange={(v) => set('red_letter', v)} />
        <CheckboxField label="Paragraphes" checked={form.paragraph} onChange={(v) => set('paragraph', v)} />
        <CheckboxField label="Recherche" checked={form.research} onChange={(v) => set('research', v)} />
        <CheckboxField label="Copyright" checked={form.copyright} onChange={(v) => set('copyright', v)} />
      </div>
    </div>
  )
}

export default function BibleVersions() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [uploadedVerses, setUploadedVerses] = useState<BibleVerse[] | null>(null)
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; count: number } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['bible-versions'],
    queryFn: api.getBibleVersions,
  })

  const selected = data?.versions?.find((v) => v.key === selectedKey) ?? null

  const resetUpload = () => {
    setUploadedVerses(null)
    setUploadedFileInfo(null)
    setUploadError(null)
  }

  const closePanel = () => {
    setSelectedKey(null)
    setIsCreating(false)
    setIsEditing(false)
    resetUpload()
  }

  const openView = (key: string) => {
    setIsCreating(false)
    setIsEditing(false)
    setSelectedKey(key)
    resetUpload()
  }

  const openCreate = () => {
    setSelectedKey(null)
    setForm(EMPTY_FORM)
    setIsCreating(true)
    setIsEditing(true)
    resetUpload()
  }

  const startEdit = () => {
    if (!selected) return
    setForm(metadataToForm(selected.metadata))
    setIsEditing(true)
    resetUpload()
  }

  const cancelEdit = () => {
    if (isCreating) {
      closePanel()
    } else {
      setIsEditing(false)
      resetUpload()
    }
  }

  const handleFileSelected = async (file: File) => {
    setUploadError(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const verses: BibleVerse[] | null = Array.isArray(parsed.verses)
        ? parsed.verses
        : Array.isArray(parsed)
          ? parsed
          : null

      if (!verses) {
        setUploadedVerses(null)
        setUploadedFileInfo(null)
        setUploadError('Fichier invalide : tableau "verses" introuvable')
        return
      }

      setUploadedVerses(verses)
      setUploadedFileInfo({ name: file.name, count: verses.length })
      if (parsed.metadata) {
        setForm((prev) => ({ ...prev, ...metadataToForm(parsed.metadata) }))
      }
    } catch {
      setUploadedVerses(null)
      setUploadedFileInfo(null)
      setUploadError('Impossible de lire ce fichier JSON')
    }
  }

  const deleteMutation = useMutation({
    mutationFn: api.deleteBibleVersion,
    onSuccess: (_, key) => {
      queryClient.invalidateQueries({ queryKey: ['bible-versions'] })
      setSelectedKey((cur) => (cur === key ? null : cur))
    },
  })

  const createMutation = useMutation({
    mutationFn: api.createBibleVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-versions'] })
      closePanel()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: BibleVersionUpdateInput }) => api.updateBibleVersion(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-versions'] })
      setIsEditing(false)
      resetUpload()
    },
  })

  const handleDelete = (version: BibleVersion) => {
    const label = version.metadata?.name ?? version.key
    if (!window.confirm(`Supprimer définitivement la version « ${label} » ?`)) return
    deleteMutation.mutate(version.key)
  }

  const handleSave = () => {
    const payload = formToPayload(form)
    if (isCreating) {
      createMutation.mutate(uploadedVerses ? { ...payload, verses: uploadedVerses } : payload)
    } else if (selected) {
      updateMutation.mutate({
        key: selected.key,
        data: uploadedVerses ? { ...payload, verses: uploadedVerses } : payload,
      })
    }
  }

  const panelOpen = isCreating || !!selected
  const showForm = isCreating || isEditing

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Versions de la Bible</h1>
          <p className="mt-1 text-sm text-gray-500">
            {data ? `${data.count} version${data.count > 1 ? 's' : ''} disponible${data.count > 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Ajouter une version
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data?.versions.length ? (
        <Card>
          <p className="text-sm text-gray-500">Aucune version de bible trouvée.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.versions.map((version) => (
            <Card
              key={version.key}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => openView(version.key)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {version.metadata ? (
                    <>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-100">{version.metadata.name}</span>
                        <Badge>{version.metadata.shortname}</Badge>
                        <Badge>{version.metadata.lang_short?.toUpperCase()}</Badge>
                        {version.metadata.year && <Badge>{version.metadata.year}</Badge>}
                        {!!version.metadata.official && (
                          <Badge tone="success">
                            <ShieldCheck className="mr-1 h-3 w-3" /> Officielle
                          </Badge>
                        )}
                        {!!version.metadata.restrict && (
                          <Badge tone="warning">
                            <Lock className="mr-1 h-3 w-3" /> Restreinte
                          </Badge>
                        )}
                      </div>
                      {version.metadata.description && (
                        <p className="truncate text-sm text-gray-400">{version.metadata.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {version.verset ?? 0} versets · {formatBytes(version.size)}
                        {version.metadata.publisher ? ` · ${version.metadata.publisher}` : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-100">{version.key}</p>
                      <p className="mt-1 text-xs text-red-400">{version.error ?? 'Métadonnées indisponibles'}</p>
                    </>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="ghost"
                    className="px-2.5 py-1.5 text-red-400"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(version)
                    }}
                    disabled={deleteMutation.isPending}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DetailPanel
        open={panelOpen}
        onClose={closePanel}
        title={isCreating ? 'Nouvelle version' : selected?.metadata?.name ?? selected?.key ?? ''}
        subtitle={isCreating ? 'Créer une nouvelle version de la Bible' : selected?.metadata?.shortname}
        footer={
          showForm ? (
            <>
              <Button variant="ghost" onClick={cancelEdit}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                Enregistrer
              </Button>
            </>
          ) : (
            selected && (
              <>
                <Button
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => handleDelete(selected)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </Button>
                <Button onClick={startEdit}>
                  <Pencil className="h-4 w-4" /> Modifier
                </Button>
              </>
            )
          )
        }
      >
        {showForm ? (
          <div className="flex flex-col gap-4">
            <FileUploadField
              fileName={uploadedFileInfo?.name ?? null}
              verseCount={uploadedFileInfo?.count ?? null}
              error={uploadError}
              currentVerseCount={!isCreating ? selected?.verset ?? 0 : null}
              onFile={handleFileSelected}
            />
            <BibleVersionFormFields form={form} onChange={setForm} />
          </div>
        ) : (
          selected && (
            selected.metadata ? (
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{selected.metadata.lang_short?.toUpperCase()}</Badge>
                  {selected.metadata.year && <Badge>{selected.metadata.year}</Badge>}
                  {!!selected.metadata.official && (
                    <Badge tone="success">
                      <ShieldCheck className="mr-1 h-3 w-3" /> Officielle
                    </Badge>
                  )}
                  {!!selected.metadata.restrict && (
                    <Badge tone="warning">
                      <Lock className="mr-1 h-3 w-3" /> Restreinte
                    </Badge>
                  )}
                </div>
                <DetailField label="Description" value={selected.metadata.description} />
                <DetailField label="Éditeur" value={selected.metadata.publisher} />
                <DetailField label="Propriétaire" value={selected.metadata.owner} />
                <DetailField label="Copyright" value={selected.metadata.copyright_statement} />
                <DetailField label="URL" value={selected.metadata.url} />
                <DetailField label="Module" value={selected.metadata.module} />
                <DetailField label="Version du module" value={selected.metadata.module_version} />
                <DetailField label="Versets" value={selected.verset} />
                <DetailField label="Taille du fichier" value={formatBytes(selected.size)} />
                <DetailField label="Clé de stockage (R2)" value={selected.key} />
                <DetailField label="Importée le" value={new Date(selected.uploaded).toLocaleString('fr-FR')} />
              </div>
            ) : (
              <div>
                <DetailField label="Clé de stockage (R2)" value={selected.key} />
                <DetailField label="Erreur" value={selected.error ?? 'Métadonnées indisponibles'} />
                <DetailField label="Taille du fichier" value={formatBytes(selected.size)} />
              </div>
            )
          )
        )}
      </DetailPanel>
    </div>
  )
}
