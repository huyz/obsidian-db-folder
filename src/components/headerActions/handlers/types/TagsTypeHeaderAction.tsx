import { HeaderActionResponse } from "cdm/HeaderActionModel";
import { AbstractHeaderAction } from "components/headerActions/handlers/AbstractHeaderAction";
import React from "react";
import { ActionTypes, InputLabel, InputType } from "helpers/Constants";
import TagsIcon from "components/img/TagsIcon";
import headerTypeComponent from "components/headerActions/HeaderTypeComponent";

export default class TagsTypeHeaderAction extends AbstractHeaderAction {
  globalHeaderActionResponse: HeaderActionResponse;
  handle(headerActionResponse: HeaderActionResponse): HeaderActionResponse {
    this.globalHeaderActionResponse = headerActionResponse;
    this.addTagsType();
    return this.goNext(this.globalHeaderActionResponse);
  }
  private addTagsType() {
    this.globalHeaderActionResponse.buttons.push(
      tagsTypeComponent(this.globalHeaderActionResponse)
    );
  }
}

function tagsTypeComponent(headerActionResponse: HeaderActionResponse) {
  const { hooks } = headerActionResponse;
  const { table, column } = headerActionResponse.headerMenuProps.headerProps;
  const tagsOnClick = (e: any) => {
    table.options.meta.dispatch({
      type: ActionTypes.UPDATE_COLUMN_TYPE,
      columnId: column.id,
      input: InputType.TAGS,
    });
    hooks.setShowType(false);
    hooks.setExpanded(false);
  };
  return headerTypeComponent({
    onClick: tagsOnClick,
    icon: <TagsIcon />,
    label: InputLabel.TAGS,
  });
}
