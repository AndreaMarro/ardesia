"""Local teacher export of a discipline pack, including its private scoring keys and explanations."""
import argparse
import os
from pathlib import Path
import tempfile
from xml.etree import ElementTree as ET
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from multidiscipline.pack import load_pack

QTI = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
CP = "http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"
SCHEMAS = "https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/"


def element(parent, tag, text=None, **attributes):
    node = ET.SubElement(parent, tag, {k.replace("_","-"):str(v) for k,v in attributes.items()})
    node.text = text
    return node


def document(tag, namespace, schema, **attributes):
    return ET.Element(tag, {"xmlns":namespace, "xmlns:xsi":"http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation":namespace + " " + SCHEMAS + schema, **attributes})


def assessment(unit, activity):
    root = document("qti-assessment-item", QTI, "imsqti_asiv3p0p1_v1p0.xsd",
                    identifier="q_"+activity["id"], title=unit["title"],
                    **{"time-dependent":"false","adaptive":"false","xml:lang":"it"})
    response = element(root, "qti-response-declaration", identifier="RESPONSE", cardinality="single", base_type="identifier")
    element(element(response, "qti-correct-response"), "qti-value", "o_"+activity["correctOptionId"])
    for key, base in (("SCORE","float"),("FEEDBACK","identifier")):
        element(root, "qti-outcome-declaration", identifier=key, cardinality="single", base_type=base)
    choice = element(element(root,"qti-item-body"), "qti-choice-interaction",
                     response_identifier="RESPONSE", max_choices="1", shuffle="false")
    element(choice, "qti-prompt", activity["prompt"])
    for option in activity["options"]:
        element(choice,"qti-simple-choice",option["text"],identifier="o_"+option["id"])
    processing = element(root,"qti-response-processing")
    condition = element(processing,"qti-response-condition")
    yes = element(condition,"qti-response-if")
    match = element(yes,"qti-match")
    element(match,"qti-variable",identifier="RESPONSE")
    element(match,"qti-correct",identifier="RESPONSE")
    for branch, value in ((yes,"1"),(element(condition,"qti-response-else"),"0")):
        element(element(branch,"qti-set-outcome-value",identifier="SCORE"),"qti-base-value",value,base_type="float")
    element(element(processing,"qti-set-outcome-value",identifier="FEEDBACK"),"qti-variable",identifier="RESPONSE")
    for option in activity["options"]:
        feedback = element(root,"qti-modal-feedback",outcome_identifier="FEEDBACK",show_hide="show",identifier="o_"+option["id"])
        body = element(feedback,"qti-content-body")
        element(body,"p",activity["feedback"][option["id"]])
        for step in activity["solution"]:
            element(body,"p",step["title"] + ". " + step["body"])
        for alternative in activity["options"]:
            element(body,"p",alternative["text"] + " — " + activity["feedback"][alternative["id"]])
        element(body,"p",activity["transfer"]["prompt"] + " " + activity["transfer"]["answer"])
    return root


def add_xml(archive, filename, node):
    entry = ZipInfo(filename, date_time=(1980,1,1,0,0,0))
    entry.external_attr = 0o100600 << 16
    ET.indent(node)
    archive.writestr(entry,ET.tostring(node,encoding="utf-8",xml_declaration=True),compress_type=ZIP_DEFLATED)


def export(catalog_path, destination):
    catalog, units = load_pack(catalog_path)
    manifest = document("manifest",CP,"imsqtiv3p0_imscpv1p2_v1p0.xsd",identifier="m_"+catalog["id"]+"_"+catalog["version"])
    metadata = element(manifest,"metadata")
    element(metadata,"schema","QTI Item Bank")
    element(metadata,"schemaversion","3.0.0")
    element(manifest,"organizations")
    resources = element(manifest,"resources")
    # Publish the completed archive atomically, leaving an existing export intact on failure.
    with tempfile.NamedTemporaryFile(dir=destination.parent,suffix=".zip",delete=False) as tmp:
        temporary = Path(tmp.name)
    count = 0
    try:
        with ZipFile(temporary,"w") as archive:
            for unit in units.values():
                for activity in unit["activities"]:
                    filename = "items/" + activity["id"] + ".xml"
                    resource = element(resources,"resource",identifier="r_"+activity["id"],type="imsqti_item_xmlv3p0",href=filename)
                    element(resource,"file",href=filename)
                    add_xml(archive,filename,assessment(unit,activity))
                    count += 1
            add_xml(archive,"imsmanifest.xml",manifest)
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)
    return count


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalog",type=Path)
    parser.add_argument("destination",type=Path)
    args = parser.parse_args()
    print(export(args.catalog,args.destination), "quesiti nel pacchetto QTI 3")
