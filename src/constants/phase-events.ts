// Phase/event mapping for frontend UI signals
// Frontend can dispatch a UI event named WEBSITE_BUILDER_EVENT when the tool
// with id WEBSITE_BUILDER_TOOL_ID starts/ends in the agent stream.
export const WEBSITE_BUILDER_TOOL_IDS = ['preview-contentstack-content-model', 'notify-website-builder-start'];
export const WEBSITE_BUILDER_EVENT = 'website-builder-start';
export const WEBSITE_BUILDER_LABEL = 'Website builder start';

export function isWebsiteBuilderTool(toolId: string): boolean {
  return WEBSITE_BUILDER_TOOL_IDS.includes(toolId);
}


