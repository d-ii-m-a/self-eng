import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { MistakeModel } from "./mistakeSchema";

export class MistakeList extends D1ListEndpoint<HandleArgs> {
	_meta = {
		model: MistakeModel,
	};

	searchFields = ["original", "correction", "explanation", "pattern", "subpattern"];
	defaultOrderBy = "created_at DESC";
}
