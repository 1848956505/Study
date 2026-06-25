export function getKnowledgePointFormUpdates(form, FormDataCtor = FormData) {
  const formData = new FormDataCtor(form);
  const checkedTagIds = Array.from(form.querySelectorAll('[data-knowledge-point-edit-tag-input]:checked'))
    .map((input) => input.value)
    .filter(Boolean);
  const hiddenTagIds = formData.getAll('tagIds').map((tagId) => String(tagId)).filter(Boolean);

  return {
    title: String(formData.get('title') ?? '').trim(),
    comment: String(formData.get('comment') ?? '').trim(),
    tagIds: [...new Set([...hiddenTagIds, ...checkedTagIds])]
  };
}
